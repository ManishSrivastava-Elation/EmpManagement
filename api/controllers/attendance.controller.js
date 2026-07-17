import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const checkIn = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};

    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: [
          {
            field: "Authorization",
            message: "Token must include EmployeeId and CompanyId",
          },
        ],
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Check-in image is required",
        error: [
          { field: "image", message: "Image file is required for check-in" },
        ],
      });
    }

    const body = req.body;
    const checkInImageUrl = `/uploads/${req.file.filename}`;

    const values = [
      CompanyId,
      EmployeeId,
      body.CheckInTime,
      body.CheckInLatitude,
      body.CheckInLongitude,
      checkInImageUrl,
      body.IsWithinGeoFence,
      body.Remarks,
      body.DynamicAddress,
      body.LocationSource,
      body.AccuracyMeters,
      body.FaceVerified,
      body.ImageTimestamp,
      body.DeviceInfo,
      body.LocalId,
      body.Address,
    ];

    const sql = `
      INSERT INTO Attendance (
        company_id,
        employee_id,
        check_in_time,
        check_in_latitude,
        check_in_longitude,
        check_in_selfie_url,
        is_within_geofence,
        remarks,
        dynamic_address,
        location_source,
        accuracy_meters,
        face_verified,
        image_timestamp,
        device_info,
        local_id,
        address
      )
      VALUES (${values.map(() => "?").join(", ")})
    `;

    const result = await query(sql, values);

    const job_id = body.job_id;
    if (job_id) {
      await query(
        `UPDATE Jobs
         SET status = 'IN_PROGRESS',
             updated_at = NOW()
         WHERE id = ?`,
        [job_id],
      );
    }

    return apiResponse({
      res,
      statusCode: 201,
      message: "Check-in successful",
      data: {
        AttendanceId: result.insertId,
        imageUrl: checkInImageUrl,
        fileName: req.file.filename,
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      statusCode: 500,
      success: false,
      message: "Failed to check-in",
      error: err.message,
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};
    const { attendanceId } = req.params;

    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: [
          {
            field: "Authorization",
            message: "Token must include EmployeeId and CompanyId",
          },
        ],
      });
    }

    if (!attendanceId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Attendance ID is required",
        error: [
          { field: "attendanceId", message: "Attendance ID is required" },
        ],
      });
    }

    // Verify the attendance belongs to the user
    const attendanceCheck = await query(
      "SELECT * FROM Attendance WHERE attendance_id = ? AND employee_id = ? AND company_id = ?",
      [attendanceId, EmployeeId, CompanyId],
    );

    if (!attendanceCheck.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Attendance record not found or access denied",
        error: [{ field: "attendanceId", message: "Invalid attendance ID" }],
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Check-out image is required",
        error: [
          { field: "image", message: "Image file is required for check-out" },
        ],
      });
    }

    const body = req.body;
    const checkOutImageUrl = `/uploads/${req.file.filename}`;

    const updateMapping = {
      CheckOutTime: "check_out_time",
      CheckOutLatitude: "check_out_latitude",
      CheckOutLongitude: "check_out_longitude",
      Remarks: "remarks",
      DynamicAddress: "dynamic_address",
      LocationSource: "location_source",
      AccuracyMeters: "accuracy_meters",
      FaceVerified: "face_verified",
      ImageTimestamp: "image_timestamp",
      DeviceInfo: "device_info",
      Address: "address",
    };

    const updateFields = ["check_out_selfie_url = ?"];
    const values = [checkOutImageUrl];

    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined && updateMapping[key]) {
        updateFields.push(`${updateMapping[key]} = ?`);
        values.push(body[key]);
      }
    });

    const sql = `UPDATE Attendance SET ${updateFields.join(", ")} WHERE attendance_id = ?`;
    values.push(attendanceId);

    await query(sql, values);

    const job_id = body.job_id;
    if (job_id) {
      await query(
        `UPDATE Jobs
         SET status = 'COMPLETED',
             updated_at = NOW()
         WHERE id = ?`,
        [job_id],
      );
    }

    return apiResponse({
      res,
      message: "Check-out successful",
      data: {
        AttendanceId: attendanceId,
        imageUrl: checkOutImageUrl,
        fileName: req.file.filename,
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      statusCode: 500,
      success: false,
      message: "Failed to check-out",
      error: err.message,
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const EmployeeId = req.user?.employeeId || req.user?.EmployeeId;
    const CompanyId = req.user?.CompanyId || req.user?.companyId;
    const Role = req?.user?.Role || req?.user?.role;

    const { startDate, endDate, status, search, employee_id, sortBy, order } =
      req.query;

    const allowedStatus = ["pending", "approved", "rejected"];

    if (status && !allowedStatus.includes(status)) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Invalid status",
      });
    }

    // For meta count (NO status filter)
    let baseWhere = ` WHERE 1=1 `;
    const baseParams = [];

    // For data (WITH status filter)
    let dataWhere = ` WHERE 1=1 `;
    const dataParams = [];

    // Role filter
    const addRoleFilter = () => {
      if (Role === "employee") {
        baseWhere += ` AND a.employee_id=? AND a.company_id=?`;
        dataWhere += ` AND a.employee_id=? AND a.company_id=?`;

        baseParams.push(EmployeeId, CompanyId);
        dataParams.push(EmployeeId, CompanyId);
      } else if (Role === "company") {
        baseWhere += ` AND a.company_id=?`;
        dataWhere += ` AND a.company_id=?`;

        baseParams.push(CompanyId);
        dataParams.push(CompanyId);
      } else if (Role === "superadmin") {
        // no filter
      }
    };

    addRoleFilter();

    // Date filter
    if (startDate) {
      baseWhere += ` AND DATE(a.check_in_time)>=?`;
      dataWhere += ` AND DATE(a.check_in_time)>=?`;

      baseParams.push(startDate);
      dataParams.push(startDate);
    }

    if (endDate) {
      baseWhere += ` AND DATE(a.check_in_time)<=?`;
      dataWhere += ` AND DATE(a.check_in_time)<=?`;

      baseParams.push(endDate);
      dataParams.push(endDate);
    }

    if (search && search.trim()) {
      const like = `%${search.trim()}%`;
      baseWhere += ` AND (e.full_name LIKE ? OR e.employee_code LIKE ? OR a.address LIKE ?)`;
      dataWhere += ` AND (e.full_name LIKE ? OR e.employee_code LIKE ? OR a.address LIKE ?)`;
      baseParams.push(like, like, like);
      dataParams.push(like, like, like);
    }

    if (employee_id) {
      baseWhere += ` AND a.employee_id=?`;
      dataWhere += ` AND a.employee_id=?`;
      baseParams.push(employee_id);
      dataParams.push(employee_id);
    }

    // Only DATA gets status filter
    if (status) {
      dataWhere += ` AND a.status=?`;
      dataParams.push(status);
    }

    // ── Pagination ─────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(req.query.page ?? "1"));
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? "10")),
    );
    const offset = (pageNum - 1) * limitNum;

    const allowedSort = [
      "attendance_id",
      "check_in_time",
      "created_at",
      "status",
      "employee_name",
    ];
    const allowedOrder = ["ASC", "DESC"];
    const finalSort = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const finalOrder = allowedOrder.includes(String(order || "").toUpperCase())
      ? String(order || "").toUpperCase()
      : "DESC";

    const attendanceSql = `
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
        a.status AS Status,
        c.company_name AS CompanyName,
        e.full_name AS EmployeeName,
        e.employee_code AS EmployeeCode,
        e.mobile_no AS MobileNo
      FROM Attendance a
      INNER JOIN Companies c
        ON c.company_id=a.company_id
      INNER JOIN Employees e
        ON e.employee_id=a.employee_id
      ${dataWhere}
      ORDER BY ${finalSort === "employee_name" ? "e.full_name" : `a.${finalSort}`} ${finalOrder}
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT
        COUNT(*) total,
        SUM(a.status='pending') pending,
        SUM(a.status='approved') approved,
        SUM(a.status='rejected') rejected
      FROM Attendance a
      ${baseWhere}
    `;

    const [data, [metaRow]] = await Promise.all([
      query(attendanceSql, [...dataParams, limitNum, offset]),
      query(countSql, baseParams),
    ]);

    const total = Number(metaRow.total || 0);
    const totalPages = Math.ceil(total / limitNum);

    return apiResponse({
      res,
      success: true,
      message: "Attendance fetched successfully",
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        pending: Number(metaRow.pending || 0),
        approved: Number(metaRow.approved || 0),
        rejected: Number(metaRow.rejected || 0),
      },
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

export const updateAttendanceStatus = async (req, res) => {
  try {
    const CompanyId = req?.user?.CompanyId || req?.user?.companyId;
    const Role = req?.user?.Role || req?.user?.role;
    const { attendanceId } = req.params;
    const { status } = req.body;

    if (!CompanyId || Role !== "company") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Access denied",
      });
    }

    const attendance = await query(
      `
      SELECT attendance_id
      FROM Attendance
      WHERE attendance_id = ?
      AND company_id = ?
      `,
      [attendanceId, CompanyId],
    );

    if (!attendance.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Attendance not found",
      });
    }

    await query(
      `
      UPDATE Attendance
      SET status = ?, updated_at = NOW()
      WHERE attendance_id = ?
      `,
      [status, attendanceId],
    );

    return apiResponse({
      res,
      success: true,
      message: `Attendance ${status} successfully`,
      data: {
        AttendanceId: attendanceId,
        Status: status,
      },
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
