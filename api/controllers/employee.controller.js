import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

// ─────────────────────────────────────────────────────────────────────────────
// getAllEmployees
// Employees columns: employee_id, company_id, employee_code, full_name,
//                    mobile_no, email, status, created_at, updated_at
// Companies columns: company_id, company_name
// Token: CompanyId (PascalCase) in company role, Role field
// ─────────────────────────────────────────────────────────────────────────────
export const getAllEmployees = async (req, res) => {
  
  try {
    const Role  = req?.user?.role || req?.user?.Role;
    const CompanyId = req?.user?.companyId || req?.user?.CompanyId    

    if (!Role || (Role !== "company" && Role !== "superadmin")) {
      return apiResponse({ res, success: false, statusCode: 403, message: "Access denied" });
    }
    const {
      status,
      startDate,
      endDate,
      search,
      employee_id,
      sortBy = "created_at",
      order = "DESC",
    } = req.query;

    const allowedSort  = ["employee_id", "company_id", "employee_code", "full_name", "email", "status", "created_at"];
    const allowedOrder = ["ASC", "DESC"];
    const finalSort    = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const finalOrder   = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

    let sql = `
      SELECT
        e.employee_id,
        e.company_id,
        c.company_name,
        e.employee_code,
        e.full_name,
        e.mobile_no,
        e.email,
        e.status,
        e.emp_verified,
        e.email_verified,
        e.mobile_verified,
        e.created_at,
        e.updated_at
      FROM Employees e
      INNER JOIN Companies c ON e.company_id = c.company_id
      WHERE 1=1
    `;

    const params = [];

    // Role-based scoping from token
    if (Role === "company") {
      sql += ` AND e.company_id = ?`;
      params.push(CompanyId);
    }

    // Status filter — Employees.status: ACTIVE, INACTIVE
    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status.toUpperCase());
    }

    // Search filter
    if (search && search.trim()) {
      sql += ` AND (e.full_name LIKE ? OR e.employee_code LIKE ? OR e.email LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (employee_id) {
      sql += ` AND e.employee_id = ?`;
      params.push(employee_id);
    }

    // Date range filter
    if (startDate && endDate) {
      sql += ` AND DATE(e.created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      sql += ` AND DATE(e.created_at) >= ?`;
      params.push(startDate);
    } else if (endDate) {
      sql += ` AND DATE(e.created_at) <= ?`;
      params.push(endDate);
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(req.query.page  ?? "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "10")));
    const offset   = (pageNum - 1) * limitNum;

    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, "SELECT COUNT(*) AS total FROM");

    sql += ` ORDER BY e.${finalSort} ${finalOrder} LIMIT ? OFFSET ?`;

    const [data, [countRow]] = await Promise.all([
      query(sql, [...params, limitNum, offset]),
      query(countSql, params),
    ]);

    const total      = Number(countRow?.total || 0);
    const totalPages = Math.ceil(total / limitNum);

    return apiResponse({
      res,
      success: true,
      message: "Employees fetched successfully",
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
      message: "Failed to fetch employees",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// updateEmployeeStatus
// Employees.status enum: ACTIVE, INACTIVE (no BLOCKED in schema)
// ─────────────────────────────────────────────────────────────────────────────
export const getEmployeeOptions = async (req, res) => {
  try {
    const Role = req?.user?.role || req?.user?.Role;
    const CompanyId = req?.user?.companyId || req?.user?.CompanyId;

    if (Role !== "company") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Access denied" });
    }

    const { search, phone } = req.query;
    const params = [CompanyId];

    let sql = `SELECT employee_id AS id, full_name AS employee_name
               FROM Employees
               WHERE company_id = ? AND status = 'ACTIVE'`;

    if (search?.trim()) {
      sql += ` AND full_name LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    if (phone?.trim()) {
      sql += ` AND mobile_no LIKE ?`;
      params.push(`%${phone.trim()}%`);
    }

    sql += ` ORDER BY full_name ASC LIMIT 20`;

    const data = await query(sql, params);

    return apiResponse({ res, statusCode: 200, message: "Employee options fetched", data });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to fetch employee options", error: err.message });
  }
};

export const updateEmployeeStatus = async (req, res) => {
  try {
    const Role = req?.user?.role || req?.user?.Role;
    const CompanyId = req?.user?.companyId || req?.user?.CompanyId;

    if (Role !== "company") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Only company role can update employee status" });
    }

    const employeeId = req.params.id;
    const { status } = req.body;

    if (!employeeId || !status) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Employee id and status are required" });
    }

    // Only ACTIVE / INACTIVE — BLOCKED does not exist in the schema
    const allowed = ["ACTIVE", "INACTIVE"];
    const newStatus = String(status).toUpperCase();
    if (!allowed.includes(newStatus)) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Invalid status value. Must be ACTIVE or INACTIVE" });
    }

    const emp = await query(
      "SELECT employee_id, company_id FROM Employees WHERE employee_id = ?",
      [employeeId]
    );

    if (!emp.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Employee not found" });
    }

    if (emp[0].company_id !== CompanyId) {
      return apiResponse({ res, success: false, statusCode: 403, message: "You do not have permission to modify this employee" });
    }

    await query(
      "UPDATE Employees SET status = ?, updated_at = NOW() WHERE employee_id = ?",
      [newStatus, employeeId]
    );

    return apiResponse({ res, success: true, message: "Employee status updated", data: { employee_id: employeeId, status: newStatus } });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to update employee status", error: err.message });
  }
};
