import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

// ─────────────────────────────────────────────────────────────────────────────
// getAllEmployeesAdmin
// Employees columns: employee_id, company_id, employee_code, full_name,
//                    mobile_no, email, status, created_at, updated_at
// Companies columns: company_id, company_name
// NOTE: No Role or IsActive columns exist in these tables
// ─────────────────────────────────────────────────────────────────────────────
export const getAllEmployeesAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT
        e.employee_id    AS EmployeeId,
        e.company_id     AS CompanyId,
        c.company_name   AS CompanyName,
        e.employee_code  AS EmployeeCode,
        e.full_name      AS FullName,
        e.mobile_no      AS MobileNo,
        e.email          AS Email,
        e.status         AS Status,
        e.emp_verified   AS EmpVerified,
        e.created_at     AS CreatedAt,
        e.updated_at     AS UpdatedAt
      FROM Employees e
      INNER JOIN Companies c ON e.company_id = c.company_id
      ORDER BY e.created_at DESC
    `;

    const data = await query(sql);

    return apiResponse({
      res,
      message: "All employees fetched successfully",
      data,
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
// updateAttendanceStatus (admin)
// Attendance columns: attendance_id, status (enum pending/approved/rejected)
// ─────────────────────────────────────────────────────────────────────────────
export const updateAttendanceStatus = async (req, res) => {
  try {
    const { Role } = req.user || {};
    const { attendanceId } = req.params;
    const { Status } = req.body;

    if (Role !== "admin") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Forbidden: Only admins can update status",
      });
    }

    if (!attendanceId || !Status) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Attendance ID and Status are required",
      });
    }

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(Status.toLowerCase())) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    const sql = "UPDATE Attendance SET status = ?, updated_at = NOW() WHERE attendance_id = ?";
    await query(sql, [Status.toLowerCase(), attendanceId]);

    return apiResponse({
      res,
      message: `Attendance status updated to ${Status} successfully`,
      data: { attendanceId, Status },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to update attendance status",
      error: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// getAllAttendanceAdmin
// Attendance columns: all snake_case
// Companies: company_id, company_name
// Employees: employee_id, full_name, employee_code, mobile_no
// ─────────────────────────────────────────────────────────────────────────────
export const getAllAttendanceAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT
        a.attendance_id         AS AttendanceId,
        a.company_id            AS CompanyId,
        a.employee_id           AS EmployeeId,
        a.check_in_time         AS CheckInTime,
        a.check_out_time        AS CheckOutTime,
        a.check_in_latitude     AS CheckInLatitude,
        a.check_in_longitude    AS CheckInLongitude,
        a.check_out_latitude    AS CheckOutLatitude,
        a.check_out_longitude   AS CheckOutLongitude,
        a.check_in_selfie_url   AS CheckInSelfieUrl,
        a.check_out_selfie_url  AS CheckOutSelfieUrl,
        a.is_within_geofence    AS IsWithinGeoFence,
        a.remarks               AS Remarks,
        a.dynamic_address       AS DynamicAddress,
        a.address               AS Address,
        a.location_source       AS LocationSource,
        a.accuracy_meters       AS AccuracyMeters,
        a.face_verified         AS FaceVerified,
        a.image_timestamp       AS ImageTimestamp,
        a.device_info           AS DeviceInfo,
        a.local_id              AS LocalId,
        a.status                AS Status,
        a.created_at            AS CreatedAt,
        a.updated_at            AS UpdatedAt,
        c.company_name          AS CompanyName,
        e.full_name             AS EmployeeName,
        e.employee_code         AS EmployeeCode,
        e.mobile_no             AS MobileNo
      FROM Attendance a
      INNER JOIN Companies c ON a.company_id = c.company_id
      INNER JOIN Employees e ON a.employee_id = e.employee_id
      ORDER BY a.attendance_id DESC
    `;

    const data = await query(sql);

    return apiResponse({
      res,
      message: "All attendance fetched successfully",
      data,
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch attendance",
      error: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// adminAddExpense
// Employees columns: employee_id, company_id (snake_case)
// Expenses columns: CompanyId, EmployeeId, Title, Description, Amount,
//                   ExpenseDate, Category, ReceiptUrl (PascalCase)
// ─────────────────────────────────────────────────────────────────────────────
export const adminAddExpense = async (req, res) => {
  try {
    const { CompanyId, Role } = req.user || {};

    if (Role !== "admin") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Only admin can add expenses" });
    }

    const { employeeId, amount, description, expenseType, hasBill } = req.body;

    // Employees uses snake_case: employee_id, company_id
    const empCheck = await query(
      "SELECT employee_id FROM Employees WHERE employee_id = ? AND company_id = ?",
      [employeeId, CompanyId]
    );

    if (!empCheck.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Employee not found in your company" });
    }

    const ReceiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (hasBill === true && !ReceiptUrl) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Bill file is required when hasBill is true" });
    }

    // Expenses uses PascalCase columns
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

// ─────────────────────────────────────────────────────────────────────────────
// adminCheckout
// Attendance columns: attendance_id, company_id, check_out_time (snake_case)
// CompanyId from token: req.user.CompanyId (employee token) or req.user.companyId
// ─────────────────────────────────────────────────────────────────────────────
export const adminCheckout = async (req, res) => {
  try {
    const companyId = req.user?.CompanyId || req.user?.companyId;
    const { Role } = req.user || {};
    const { AttendanceId, CheckOutTime } = req.body;

    if (Role !== "admin") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Only admin can perform checkout" });
    }

    if (!AttendanceId || !CheckOutTime) {
      return apiResponse({ res, success: false, statusCode: 400, message: "AttendanceId and CheckOutTime are required" });
    }

    const attendance = await query(
      "SELECT attendance_id FROM Attendance WHERE attendance_id = ? AND company_id = ?",
      [AttendanceId, companyId]
    );

    if (!attendance.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Attendance record not found" });
    }

    await query(
      "UPDATE Attendance SET check_out_time = ?, updated_at = NOW() WHERE attendance_id = ?",
      [CheckOutTime, AttendanceId]
    );

    return apiResponse({ res, message: "Checkout successful", data: { AttendanceId } });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to checkout", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// adminAddAttendance
// Attendance columns: company_id, employee_id, check_in_time, remarks,
//                     address, check_out_time (all snake_case)
// CompanyId from token instead of hardcoded 1
// ─────────────────────────────────────────────────────────────────────────────
export const adminAddAttendance = async (req, res) => {
  try {
    const companyId = req.user?.CompanyId || req.user?.companyId;

    let {
      EmployeeId,
      CheckInTime,
      Remarks,
      Address,
      CheckOutTime,
    } = req.body;

    if (!EmployeeId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "EmployeeId is required",
        error: [{ field: "EmployeeId", message: "EmployeeId is required" }],
      });
    }

    const cleanDateTime = (value) => {
      if (!value) return null;
      if (typeof value === "string" && value.trim() === "") return null;
      return value;
    };

    CheckInTime  = cleanDateTime(CheckInTime);
    CheckOutTime = cleanDateTime(CheckOutTime);
    Address      = Address?.trim() || null;
    Remarks      = Remarks?.trim() || null;

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

    const values = [companyId, EmployeeId, CheckInTime, Remarks, Address, CheckOutTime];
    const result = await query(sql, values);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Attendance added successfully by admin",
      data: { AttendanceId: result.insertId },
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
