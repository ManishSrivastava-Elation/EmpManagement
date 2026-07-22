import express from "express";
import {
  checkIn,
  checkOut,
  getAttendance,
  updateAttendanceStatus,
} from "../controllers/attendance.controller.js";
import { validateZod } from "../middlewares/validateZod.js";
import { authenticateToken } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { createAttendanceSchema, updateAttendanceSchema } from "../validators/attendance.schema.js";
import { validateAttendanceStatus } from "../middlewares/validateAttendanceStatus.js";
import { checkSubscription } from "../middlewares/checkSubscription.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Employee attendance management
 */

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Employee check-in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [CheckInTime, CheckInLatitude, CheckInLongitude, CheckInSelfieUrl]
 *             properties:
 *               CheckInTime: { type: string, format: date-time }
 *               CheckInLatitude: { type: number }
 *               CheckInLongitude: { type: number }
 *               CheckInSelfieUrl: { type: string, format: binary }
 *               IsWithinGeoFence: { type: boolean }
 *               Remarks: { type: string }
 *               DynamicAddress: { type: string }
 *               Address: { type: string }
 *               LocationSource: { type: string }
 *               AccuracyMeters: { type: number }
 *               FaceVerified: { type: boolean }
 *               ImageTimestamp: { type: string }
 *               DeviceInfo: { type: string }
 *               LocalId: { type: string }
 *               job_id: { type: integer, description: Optional - updates job status to IN_PROGRESS }
 *     responses:
 *       201: { description: Check-in successful }
 *       400: { description: Check-in image is required }
 *       401: { description: Invalid token payload }
 *       500: { description: Failed to check-in }
 */
router.post("/checkin", authenticateToken, upload.single("CheckInSelfieUrl"), validateZod(createAttendanceSchema), checkIn);

/**
 * @swagger
 * /api/attendance/checkout/{attendanceId}:
 *   put:
 *     summary: Employee check-out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendanceId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [CheckOutTime, CheckOutSelfieUrl]
 *             properties:
 *               CheckOutTime: { type: string, format: date-time }
 *               CheckOutLatitude: { type: number }
 *               CheckOutLongitude: { type: number }
 *               CheckOutSelfieUrl: { type: string, format: binary }
 *               Remarks: { type: string }
 *               DynamicAddress: { type: string }
 *               LocationSource: { type: string }
 *               AccuracyMeters: { type: number }
 *               FaceVerified: { type: boolean }
 *               ImageTimestamp: { type: string }
 *               DeviceInfo: { type: string }
 *               Address: { type: string }
 *               job_id: { type: integer, description: Optional - updates job status to COMPLETED }
 *     responses:
 *       200: { description: Check-out successful }
 *       400: { description: Check-out image is required or missing attendanceId }
 *       401: { description: Invalid token payload }
 *       404: { description: Attendance record not found or access denied }
 *       500: { description: Failed to check-out }
 */
router.put("/checkout/:attendanceId", authenticateToken, upload.single("CheckOutSelfieUrl"), validateZod(updateAttendanceSchema), checkOut);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance records
 *     description: Employee sees own records; company sees all company records; superadmin sees all.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by employee name, code, or address
 *       - in: query
 *         name: employee_id
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [attendance_id, check_in_time, created_at, status, employee_name], default: created_at }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Attendance fetched successfully with pagination meta }
 *       400: { description: Invalid status }
 *       500: { description: Failed to fetch attendance }
 */
router.get("/", authenticateToken, checkSubscription, getAttendance);

/**
 * @swagger
 * /api/attendance/{attendanceId}/status:
 *   patch:
 *     summary: Update attendance status (company role)
 *     description: Allows a company to update the status of an attendance record belonging to their company.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendanceId
 *         required: true
 *         schema: { type: integer }
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, approved, rejected] }
 *     responses:
 *       200: { description: Attendance status updated successfully }
 *       403: { description: Access denied - only company role allowed }
 *       404: { description: Attendance record not found }
 *       500: { description: Failed to update attendance status }
 */
router.patch("/:attendanceId/status", authenticateToken, checkSubscription, validateAttendanceStatus, updateAttendanceStatus);

export default router;