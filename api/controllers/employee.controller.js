import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const getAllEmployees = async (req, res) => {
  try {
    const { CompanyId, Role } = req.user || {};

    if (!Role || (Role !== 'company' && Role !== 'superadmin')) {
      return apiResponse({ res, success: false, statusCode: 403, message: 'Access denied' });
    }

    const {
      status,
      startDate,
      endDate,
      search,
      sortBy = "created_at",
      order = "DESC",
    } = req.query;

    const allowedSort = ["employee_id", "company_id", "employee_code", "full_name", "email", "status", "created_at"];
    const allowedOrder = ["ASC", "DESC"];
    const finalSort  = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const finalOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

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
        e.created_at,
        e.updated_at
      FROM Employees e
      INNER JOIN Companies c ON e.company_id = c.company_id
      WHERE 1=1
    `;

    const params = [];

    // ── Role-based scoping from token ────────────────────────────
    if (Role === 'company') {
      sql += ` AND e.company_id = ?`;
      params.push(CompanyId);
    }
    // superadmin: no company filter — sees all

    // Status Filter
    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status.toUpperCase());
    }

    // Search Filter
    if (search && search.trim()) {
      sql += ` AND (e.full_name LIKE ? OR e.employee_code LIKE ? OR e.email LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    // Date Range Filter
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

    // ── Pagination ───────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(req.query.page  ?? "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "10")));
    const offset   = (pageNum - 1) * limitNum;

    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) AS total FROM');

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

export const updateEmployeeStatus = async (req, res) => {
  try {
    const { CompanyId, Role } = req.user || {};
    // Only users with company role can update employee status
    if (Role !== 'company') {
      return apiResponse({ res, success: false, statusCode: 403, message: 'Only company role can update employee status' });
    }

    const employeeId = req.params.id;
    const { status } = req.body;

    if (!employeeId || !status) {
      return apiResponse({ res, success: false, statusCode: 400, message: 'Employee id and status are required' });
    }

    const allowed = ['ACTIVE', 'INACTIVE', 'BLOCKED'];
    const newStatus = String(status).toUpperCase();
    if (!allowed.includes(newStatus)) {
      return apiResponse({ res, success: false, statusCode: 400, message: 'Invalid status value' });
    }

    const emp = await query(
      'SELECT employee_id, company_id FROM Employees WHERE employee_id = ?',
      [employeeId]
    );

    if (!emp.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: 'Employee not found' });
    }

    if (emp[0].company_id !== CompanyId) {
      return apiResponse({ res, success: false, statusCode: 403, message: 'You do not have permission to modify this employee' });
    }

    await query(
      'UPDATE Employees SET status = ?, updated_at = NOW() WHERE employee_id = ?',
      [newStatus, employeeId]
    );

    return apiResponse({ res, success: true, message: 'Employee status updated', data: { employee_id: employeeId, status: newStatus } });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: 'Failed to update employee status', error: err.message });
  }
};






///  old


export const adminAddExpense = async (req, res) => {
  try {
    const { CompanyId, Role } = req.user || {};

    if (Role !== "admin") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Only admin can add expenses" });
    }

    const { employeeId, amount, description, expenseType, hasBill } = req.body;

    const empCheck = await query(
      "SELECT EmployeeId FROM Employees WHERE EmployeeId = ? AND CompanyId = ?",
      [employeeId, CompanyId]
    );

    if (!empCheck.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Employee not found in your company" });
    }

    const ReceiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (hasBill === true && !ReceiptUrl) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Bill file is required when hasBill is true" });
    }

    const result = await query(
      `INSERT INTO Expenses (CompanyId, EmployeeId, Title, Description, Amount, ExpenseDate, Category, ReceiptUrl)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [CompanyId, employeeId, expenseType, description, amount, expenseType, ReceiptUrl]
    );

    return apiResponse({
      res,
      statusCode: 201,
      message: "Expense added successfully",
      data: { ExpenseId: result.insertId, ReceiptUrl },
    });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to add expense", error: err.message });
  }
};

export const adminCheckout = async (req, res) => {
  try {
    const { CompanyId, Role } = req.user || {};
    const { AttendanceId, CheckOutTime } = req.body;

    if (Role !== "admin") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Only admin can perform checkout" });
    }

    if (!AttendanceId || !CheckOutTime) {
      return apiResponse({ res, success: false, statusCode: 400, message: "AttendanceId and CheckOutTime are required" });
    }

    const attendance = await query(
      "SELECT attendance_id FROM Attendance WHERE attendance_id = ? AND company_id = ?",
      [AttendanceId, CompanyId]
    );

    if (!attendance.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Attendance record not found" });
    }

    await query(
      "UPDATE Attendance SET check_out_time = ? WHERE attendance_id = ?",
      [CheckOutTime, AttendanceId]
    );

    return apiResponse({ res, message: "Checkout successful", data: { AttendanceId } });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to checkout", error: err.message });
  }
};

export const adminAddAttendance = async (req, res) => {
  try {
    const CompanyId = 1;

    let {
      EmployeeId,
      CheckInTime,
      Remarks,
      Address,
      CheckOutTime,
    } = req.body;

    // ─────────────────────────────
    // 1. REQUIRED VALIDATION
    // ─────────────────────────────
    if (!EmployeeId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "EmployeeId is required",
        error: [{ field: "EmployeeId", message: "EmployeeId is required" }],
      });
    }

    // ─────────────────────────────
    // 2. CLEAN DATETIME VALUES (IMPORTANT FIX)
    // ─────────────────────────────
    const cleanDateTime = (value) => {
      if (!value) return null;

      // prevent empty string issue
      if (typeof value === 'string' && value.trim() === '') return null;

      return value;
    };

    CheckInTime = cleanDateTime(CheckInTime);
    CheckOutTime = cleanDateTime(CheckOutTime);

    // ─────────────────────────────
    // 3. FIX ADDRESS TOO
    // ─────────────────────────────
    Address = Address?.trim() || null;
    Remarks = Remarks?.trim() || null;

    // ─────────────────────────────
    // 4. SQL INSERT
    // ─────────────────────────────
    const sql = `
      INSERT INTO Attendance (
        company_id,
        employee_id,
        check_in_time,
        remarks,
        address,
        check_out_time
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      CompanyId,
      EmployeeId,
      CheckInTime,
      Remarks,
      Address,
      CheckOutTime,
    ];

    const result = await query(sql, values);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Attendance added successfully by admin",
      data: {
        AttendanceId: result.insertId,
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to add attendance",
      error: err.message,
    });
  }
};


