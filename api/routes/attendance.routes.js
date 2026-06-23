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
router.get("/", authenticateToken, getAttendance);

router.patch("/:attendanceId/status", authenticateToken, validateAttendanceStatus, updateAttendanceStatus);

export default router;