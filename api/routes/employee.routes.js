import express from "express";
import { apiResponse } from "../utils/response.js";
import { adminAddAttendance, getAllEmployees, adminAddExpense, adminCheckout, updateEmployeeStatus } from "../controllers/employee.controller.js";
import { getDashboardStats, getExpenseByType } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import { validateZod } from "../middlewares/validateZod.js";
import { adminAddAttendanceSchema } from "../validators/attendance.schema.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// router.get("/dashboard/stats", authenticateToken, getDashboardStats);    => old
// router.get("/dashboard/expense-by-type", authenticateToken, getExpenseByType);   => old

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
router.get("/", authenticateToken, getAllEmployees);

router.patch('/:id/status', authenticateToken, updateEmployeeStatus);


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