import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const getAllEmployeesAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT
        e.EmployeeId,
        e.CompanyId,
        c.CompanyName,
        e.EmployeeCode,
        e.FullName,
        e.MobileNo,
        e.Email,
        e.IsActive,
        e.CreatedAt,
        e.Role
      FROM Employees e
      INNER JOIN Companies c ON e.CompanyId = c.CompanyId
      WHERE e.Role = 'employee'
      ORDER BY e.CreatedAt DESC
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

export const updateAttendanceStatus = async (req, res) => {
  try {
    const { Role } = req.user || {};
    const { attendanceId } = req.params;
    const { Status } = req.body;

    if (Role !== 'admin') {
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

    const sql = "UPDATE Attendance SET status = ? WHERE attendance_id = ?";
    await query(sql, [Status, attendanceId]);

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


export const getAllAttendanceAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT
        a.attendance_id AS AttendanceId,
        a.company_id AS CompanyId,
        a.employee_id AS EmployeeId,
        a.check_in_time AS CheckInTime,
        a.check_out_time AS CheckOutTime,
        a.check_in_latitude AS CheckInLatitude,
        a.check_in_longitude AS CheckInLongitude,
        a.check_out_latitude AS CheckOutLatitude,
        a.check_out_longitude AS CheckOutLongitude,
        a.check_in_selfie_url AS CheckInSelfieUrl,
        a.check_out_selfie_url AS CheckOutSelfieUrl,
        a.is_within_geofence AS IsWithinGeoFence,
        a.remarks AS Remarks,
        a.dynamic_address AS DynamicAddress,
        a.address AS Address,
        a.location_source AS LocationSource,
        a.accuracy_meters AS AccuracyMeters,
        a.face_verified AS FaceVerified,
        a.image_timestamp AS ImageTimestamp,
        a.device_info AS DeviceInfo,
        a.local_id AS LocalId,
        a.created_at AS CreatedAt,
        a.updated_at AS UpdatedAt,
        c.company_name AS CompanyName,
        e.full_name AS EmployeeName,
        e.employee_code AS EmployeeCode,
        e.mobile_no AS MobileNo
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


