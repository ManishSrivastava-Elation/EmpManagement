import express from "express";
import { apiResponse } from "../utils/response.js";
import { adminAddAttendance, getAllAttendanceAdmin, getAllEmployeesAdmin, updateAttendanceStatus, adminAddExpense, adminCheckout } from "../controllers/admin.controller.js";
import { getDashboardStats, getExpenseByType } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import { validateZod } from "../middlewares/validateZod.js";
import { adminAddAttendanceSchema } from "../validators/attendance.schema.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations
 */

// Dashboard
/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Dashboard stats fetched }
 */
router.get("/dashboard/stats", authenticateToken, getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/expense-by-type:
 *   get:
 *     summary: Get expense breakdown by type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Expense by type fetched }
 */
router.get("/dashboard/expense-by-type", authenticateToken, getExpenseByType);

/**
 * @swagger
 * /api/admin/employees:
 *   get:
 *     summary: Get all employees (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Employees fetched successfully }
 */
router.get("/employees", authenticateToken, getAllEmployeesAdmin);

/**
 * @swagger
 * /api/admin/attendance:
 *   get:
 *     summary: Get all attendance records (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Attendance fetched successfully }
 */
router.get("/attendance", authenticateToken, getAllAttendanceAdmin);

/**
 * @swagger
 * /api/admin/attendance/{attendanceId}/status:
 *   put:
 *     summary: Update attendance status (admin)
 *     tags: [Admin]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Status]
 *             properties:
 *               Status: { type: string, enum: [present, absent, half-day, leave] }
 *     responses:
 *       200: { description: Status updated }
 *       403: { description: Forbidden }
 */
router.put("/attendance/:attendanceId/status", authenticateToken, updateAttendanceStatus);

/**
 * @swagger
 * /api/admin/attendance/add:
 *   post:
 *     summary: Admin manually add attendance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [EmployeeId]
 *             properties:
 *               EmployeeId: { type: integer }
 *               CheckInTime: { type: string, format: date-time }
 *               CheckOutTime: { type: string, format: date-time }
 *               Remarks: { type: string }
 *               Address: { type: string }
 *     responses:
 *       201: { description: Attendance added successfully }
 */
router.post("/attendance/add", authenticateToken, validateZod(adminAddAttendanceSchema), adminAddAttendance);

/**
 * @swagger
 * /api/admin/attendance/checkout:
 *   patch:
 *     summary: Admin checkout for an employee
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [AttendanceId, CheckOutTime]
 *             properties:
 *               AttendanceId: { type: integer }
 *               CheckOutTime: { type: string, format: date-time }
 *     responses:
 *       200: { description: Checkout successful }
 *       403: { description: Forbidden }
 */
router.patch("/attendance/checkout", authenticateToken, adminCheckout);

/**
 * @swagger
 * /api/admin/expense/add:
 *   post:
 *     summary: Admin add expense for an employee
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [employeeId, amount, expenseType]
 *             properties:
 *               employeeId: { type: integer }
 *               amount: { type: number }
 *               description: { type: string }
 *               expenseType: { type: string }
 *               hasBill: { type: boolean }
 *               ReceiptUrl: { type: string, format: binary }
 *     responses:
 *       201: { description: Expense added successfully }
 *       403: { description: Forbidden }
 */
router.post("/expense/add", authenticateToken, upload.single("ReceiptUrl"), adminAddExpense);

export default router;