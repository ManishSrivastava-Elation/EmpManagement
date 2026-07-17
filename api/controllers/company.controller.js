import { query } from "../utils/dbQuery.js";
import { hashPassword, comparePassword } from "../services/password.service.js";
import { generateToken } from "../services/jwt.service.js";
import { apiResponse } from "../utils/response.js";
import { validateUnique } from "../validators/custom.validators.js";

export const createCompany = async (req, res) => {
  try {
    const body = req.body;

    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const hashedPassword = await hashPassword(body.password);

    await validateUnique({
      table: "Companies",
      column: "company_name",
      value: body.company_name,
    });

    if (body.email) {
      await validateUnique({
        table: "Companies",
        column: "email",
        value: body.email,
      });
    }

    if (body.mobile) {
      await validateUnique({
        table: "Companies",
        column: "mobile",
        value: body.mobile,
      });
    }

    const values = [
      body.company_name,
      logoUrl,
      body.contact_person_name || null,
      body.designation || null,
      body.email || null,
      body.mobile || null,
      hashedPassword,
      body.email_verified ? 1 : 0,
      body.mobile_verified ? 1 : 0,
      body.status || "ACTIVE",
    ];

    const sql = `
      INSERT INTO Companies (
        company_name,
        logo_url,
        contact_person_name,
        designation,
        email,
        mobile,
        password,
        email_verified,
        mobile_verified,
        status
      )
      VALUES (${values.map(() => "?").join(", ")})
    `;

    const result = await query(sql, values);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Company created successfully",
      data: {
        company_id: result.insertId,
        logo_url: logoUrl,
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: err.message?.includes("exists") ? 409 : 500,
      message: err.message,
      error: true,
    });
  }
};

export const loginCompany = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Email or mobile and password are required",
        error: true,
      });
    }

    const isMobile = /^[6-9]\d{9}$/.test(identifier);

    const rows = await query(
      `SELECT * FROM Companies WHERE ${isMobile ? "mobile" : "email"} = ?`,
      [isMobile ? identifier : identifier.toLowerCase()],
    );

    if (!rows.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Company not found",
        error: true,
      });
    }

    const company = rows[0];

    // Check company status
    if (company.status && company.status.toLowerCase() === "inactive") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Company is not active",
        error: true,
      });
    }

    // At least one verification required
    const isVerified =
      Boolean(company.email_verified) || Boolean(company.mobile_verified);

    if (!isVerified) {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Please verify email or mobile before login",
        data: {
          company: {
            CompanyId: company.company_id,
            CompanyName: company.company_name,
            email: company.email,
            mobile: company.mobile,
          },
        },
        error: true,
      });
    }

    const isMatch = await comparePassword(password, company.password);

    if (!isMatch) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
        error: true,
      });
    }

    const token = generateToken({
      companyId: company.company_id,
      email: company.email,
      role: "company",
    });

    return apiResponse({
      res,
      success: true,
      message: "Login successful",
      data: {
        token,
        company: {
          company_id: company.company_id,
          company_name: company.company_name,
          email: company.email,
          mobile: company.mobile,
        },
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: err.message,
      error: true,
    });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const {
      company_id,
      status,
      search,
      sortBy = "created_at",
      order = "DESC",
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM Companies WHERE 1=1`;
    let countSql = `SELECT COUNT(*) as total FROM Companies WHERE 1=1`;

    const params = [];
    const countParams = [];

    if (company_id) {
      sql += ` AND company_id = ?`;
      countSql += ` AND company_id = ?`;
      params.push(company_id);
      countParams.push(company_id);
    }

    if (status) {
      sql += ` AND status = ?`;
      countSql += ` AND status = ?`;
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      sql += ` AND company_name LIKE ?`;
      countSql += ` AND company_name LIKE ?`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    const allowedSortFields = [
      "company_id",
      "company_name",
      "created_at",
      "status",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";

    const safeOrder = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    sql += ` ORDER BY ${safeSortBy} ${safeOrder}`;

    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const rows = await query(sql, params);
    const safeRows = rows.map(({ password, ...rest }) => rest);
    const totalResult = await query(countSql, countParams);
    const total = totalResult[0]?.total || 0;

    return apiResponse({
      res,
      message: "Companies fetched successfully",
      data: safeRows,
      meta: {
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: err.message,
      error: true,
    });
  }
};

export const getCompanyOptions = async (req, res) => {
  try {
    const { search } = req.query;

    let sql = `
            SELECT 
                company_id AS companyId,
                company_name AS companyName
            FROM Companies
            WHERE 1=1
        `;

    const params = [];

    if (search) {
      sql += ` AND company_name LIKE ?`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY company_name ASC`;

    const rows = await query(sql, params);

    return apiResponse({
      res,
      message: "Company options fetched successfully",
      data: rows,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: err.message,
      error: true,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const logoUrl = req.file
      ? `/uploads/${req.file.filename}`
      : data.logo_url || null;

    const sql = `
      UPDATE Companies
      SET
        company_name=?,
        logo_url=?,
        contact_person_name=?,
        designation=?,
        email=?,
        mobile=?,
        email_verified=?,
        mobile_verified=?,
        status=?
      WHERE company_id=?
    `;

    await query(sql, [
      data.company_name ?? null,
      logoUrl,
      data.contact_person_name ?? null,
      data.designation ?? null,
      data.email ?? null,
      data.mobile ?? null,
      data.email_verified ?? 0,
      data.mobile_verified ?? 0,
      data.status ?? "ACTIVE",
      id,
    ]);

    return apiResponse({
      res,
      message: "Company updated successfully",
      data: {
        company_id: id,
        logo_url: logoUrl,
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: err.message,
      error: true,
    });
  }
};

export const toggleCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await query(
      `SELECT status FROM Companies WHERE company_id=?`,
      [id],
    );

    if (!rows.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Company not found",
        error: true,
      });
    }

    const currentStatus = rows[0].status;

    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await query(`UPDATE Companies SET status=? WHERE company_id=?`, [
      newStatus,
      id,
    ]);

    return apiResponse({
      res,
      message: `Company marked ${newStatus.toLowerCase()}`,
      data: {
        company_id: id,
        status: newStatus,
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: err.message,
      error: true,
    });
  }
};

export const verifyEmployeeByCompany = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Employee id is required",
        error: true,
      });
    }

    const companyId = req.user?.companyId || req.user?.CompanyId;
    const role = req.user?.role || req.user?.Role;

    if (!companyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token",
        error: true,
      });
    }

    if (role !== "company") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Only company can verify employees",
        error: true,
      });
    }

    // find employee
    const rows = await query(
      `
            SELECT
                employee_id,
                company_id,
                full_name,
                emp_verified
            FROM Employees
            WHERE employee_id = ?
            `,
      [employeeId],
    );

    if (!rows.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Employee not found",
        error: true,
      });
    }

    const employee = rows[0];

    // company ownership check
    if (Number(employee.company_id) !== Number(companyId)) {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "You cannot verify employees of another company",
        error: true,
      });
    }

    // already verified
    if (employee.emp_verified) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Employee already verified",
        error: true,
      });
    }

    // verify employee
    await query(
      `
            UPDATE Employees
            SET
                emp_verified = 1,
                updated_at = NOW()
            WHERE employee_id = ?
            `,
      [employeeId],
    );

    return apiResponse({
      res,
      success: true,
      message: "Employee verified successfully",
      data: {
        employee: {
          employeeId: employee.employee_id,
          companyId: employee.company_id,
          FullName: employee.full_name,
          EmpVerified: 1,
        },
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: err.message,
      error: true,
    });
  }
};

export const getCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.CompanyId;

    if (!companyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload: company session not verified",
        error: true,
      });
    }

    const rows = await query(
      `SELECT company_id, company_name, logo_url, contact_person_name, designation, email, mobile, status, created_at, updated_at 
       FROM Companies WHERE company_id = ?`,
      [companyId]
    );

    if (!rows.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Company not found",
        error: true,
      });
    }

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Company profile retrieved successfully",
      data: rows[0],
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch company profile",
      error: err.message,
    });
  }
};

export const updateCompanyPassword = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.CompanyId;
    const { current_password, new_password, confirm_password } = req.body;

    if (!companyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload: company session not verified",
        error: true,
      });
    }

    if (current_password === new_password) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Old password and new password cannot be same",
        error: true,
      });
    }

    if (new_password !== confirm_password) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "New password and confirm password do not match",
        error: true,
      });
    }

    const companies = await query(
      "SELECT password FROM Companies WHERE company_id = ?",
      [companyId]
    );

    if (!companies.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Company not found",
        error: true,
      });
    }

    const company = companies[0];

    const isValid = await comparePassword(current_password, company.password);

    if (!isValid) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Old password is incorrect",
        error: true,
      });
    }

    const hashedPassword = await hashPassword(new_password);

    await query(
      "UPDATE Companies SET password = ? WHERE company_id = ?",
      [hashedPassword, companyId]
    );

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Password updated successfully",
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to update password",
      error: err.message,
    });
  }
};
