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
 *               DeviceInfo: { type: string }
 *               LocalId: { type: string }
 *     responses:
 *       201: { description: Check-in successful }
 *       400: { description: Image required }
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
 *               Address: { type: string }
 *     responses:
 *       200: { description: Check-out successful }
 *       404: { description: Attendance record not found }
 */
router.put("/checkout/:attendanceId", authenticateToken, upload.single("CheckOutSelfieUrl"), validateZod(updateAttendanceSchema), checkOut);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get employee attendance records
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
 *     responses:
 *       200: { description: Attendance fetched successfully }
 */
router.get("/", authenticateToken, checkSubscription, getAttendance);

/**
 * @swagger
 * /api/attendance/{attendanceId}/status:
 *   patch:
 *     summary: Update attendance status (employee self-update)
 *     description: Allows an employee to update the status of their own attendance record. Validated by the validateAttendanceStatus middleware.
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
 *             required: [Status]
 *             properties:
 *               Status: { type: string, enum: [present, absent, half-day, leave] }
 *     responses:
 *       200:
 *         description: Attendance status updated successfully
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Attendance record not found
 */
router.patch("/:attendanceId/status", authenticateToken, checkSubscription, validateAttendanceStatus, updateAttendanceStatus);

export default router;