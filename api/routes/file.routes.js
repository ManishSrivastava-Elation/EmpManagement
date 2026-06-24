import express from "express";
import { getAttendanceFile, getExpensesFile, getCompanyAttendanceFile, getCompanyExpensesFile } from "../controllers/file.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Excel file exports
 */

/**
 * @swagger
 * /api/files/attendence:
 *   get:
 *     summary: Download attendance report as Excel
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *         description: Employee ID or "all"
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 */
router.get("/attendence", getAttendanceFile)

/**
 * @swagger
 * /api/files/expenses:
 *   get:
 *     summary: Download expenses report as Excel
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *         description: Employee ID or "all"
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 */
router.get("/expenses", authenticateToken, getExpensesFile)

/**
 * @swagger
 * /api/files/company/attendance:
 *   get:
 *     summary: Download company attendance report (company-scoped)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Excel file download
 */
router.get("/company/attendance", authenticateToken, getCompanyAttendanceFile)

/**
 * @swagger
 * /api/files/company/expenses:
 *   get:
 *     summary: Download company expenses report (company-scoped)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Excel file download
 */
router.get("/company/expenses", authenticateToken, getCompanyExpensesFile)

export default router;