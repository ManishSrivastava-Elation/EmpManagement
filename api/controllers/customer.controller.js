import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";
import { validateUnique } from "../validators/custom.validators.js";

// ─────────────────────────────────────────────────────────────────────────────
// getAllCustomers
// Customers columns: id, company_id, customer_name, phone,
//                    alternate_phone, email, address_line1, address_line2,
//                    city, state, pincode, gstin_number, created_at, updated_at
// Companies columns: company_id, company_name
// Token: companyId (camelCase) in company role, role field
// ─────────────────────────────────────────────────────────────────────────────
export const getAllCustomers = async (req, res) => {
  try {
    const Role      = req?.user?.role      || req?.user?.Role;
    const CompanyId = req?.user?.companyId || req?.user?.CompanyId;

    if (!Role || (Role !== "company" && Role !== "superadmin")) {
      return apiResponse({ res, success: false, statusCode: 403, message: "Access denied" });
    }

    const {
      search,
      city,
      state,
      startDate,
      endDate,
      sortBy = "created_at",
      order  = "DESC",
    } = req.query;

    const allowedSort  = ["id", "customer_name", "phone", "email", "city", "state", "created_at"];
    const allowedOrder = ["ASC", "DESC"];
    const finalSort    = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const finalOrder   = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

    let sql = `
      SELECT
        cu.id,
        cu.company_id,
        c.company_name,
        cu.customer_name,
        cu.phone,
        cu.alternate_phone,
        cu.email,
        cu.address_line1,
        cu.address_line2,
        cu.city,
        cu.state,
        cu.pincode,
        cu.gstin_number,
        cu.created_at,
        cu.updated_at
      FROM Customers cu
      INNER JOIN Companies c ON cu.company_id = c.company_id
      WHERE 1=1
    `;

    const params = [];

    // Role-based scoping from token
    if (Role === "company") {
      sql += ` AND cu.company_id = ?`;
      params.push(CompanyId);
    }

    // Search filter
    if (search && search.trim()) {
      sql += ` AND (cu.customer_name LIKE ? OR cu.phone LIKE ? OR cu.email LIKE ? OR cu.gstin_number LIKE ? OR cu.city LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    // City filter
    if (city && city.trim()) {
      sql += ` AND cu.city = ?`;
      params.push(city.trim());
    }

    // State filter
    if (state && state.trim()) {
      sql += ` AND cu.state = ?`;
      params.push(state.trim());
    }

    // Date range filter
    if (startDate && endDate) {
      sql += ` AND DATE(cu.created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      sql += ` AND DATE(cu.created_at) >= ?`;
      params.push(startDate);
    } else if (endDate) {
      sql += ` AND DATE(cu.created_at) <= ?`;
      params.push(endDate);
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(req.query.page  ?? "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "10")));
    const offset   = (pageNum - 1) * limitNum;

    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, "SELECT COUNT(*) AS total FROM");

    sql += ` ORDER BY cu.${finalSort} ${finalOrder} LIMIT ? OFFSET ?`;

    const [data, [countRow]] = await Promise.all([
      query(sql, [...params, limitNum, offset]),
      query(countSql, params),
    ]);

    const total      = Number(countRow?.total || 0);
    const totalPages = Math.ceil(total / limitNum);

    return apiResponse({
      res,
      success: true,
      message: "Customers fetched successfully",
      data,
      meta: {
        page:        pageNum,
        limit:       limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch customers",
      error: err.message,
    });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const CompanyId = req.user?.companyId;
    const Role = req.user?.role;

    if (Role !== "company") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Only company can create customers",
      });
    }

    const data = req.body;

    await validateUnique({
      table: "Customers",
      column: "phone",
      value: data.phone,
      where: {
        company_id: CompanyId,
      },
    });

    if (data.email) {
      await validateUnique({
        table: "Customers",
        column: "email",
        value: data.email,
        where: {
          company_id: CompanyId,
        },
      });
    }

    const sql = `
        INSERT INTO Customers
        (
            company_id,
            customer_name,
            phone,
            alternate_phone,
            email,
            address_line1,
            address_line2,
            city,
            state,
            pincode,
            gstin_number
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      CompanyId,
      data.customer_name,
      data.phone,
      data.alternate_phone,
      data.email,
      data.address_line1,
      data.address_line2,
      data.city,
      data.state,
      data.pincode,
      data.gstin_number,
    ]);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Customer created successfully",
      data: {
        id: result.insertId,
      },
    });
  } catch (err) {
    const statusCode =
      err.name === "ZodError"
        ? 400
        : err.message?.includes("already exists")
          ? 409
          : 500;

    return apiResponse({
      res,
      success: false,
      statusCode,
      message: err.message || "Customer creation failed",
      error: true,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getCustomerOptions
// Return lightweight list of customers for searchable dropdowns
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomerOptions = async (req, res) => {
  try {
    const Role      = req?.user?.role      || req?.user?.Role;
    const CompanyId = req?.user?.companyId || req?.user?.CompanyId;

    if (!Role || Role !== "company") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Only company can fetch customer options",
      });
    }

    const { search } = req.query;

    let sql = `
      SELECT
        cu.id,
        cu.customer_name
      FROM Customers cu
      WHERE cu.company_id = ?
    `;

    const params = [CompanyId];

    if (search && search.trim()) {
      sql += ` AND (cu.customer_name LIKE ? OR cu.phone LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }

    sql += ` ORDER BY cu.customer_name ASC LIMIT 20`;

    const data = await query(sql, params);

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Customer options fetched successfully",
      data,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch customer options",
      error: err.message,
    });
  }
};

