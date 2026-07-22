import express from "express";
import { getAttendanceFile, getExpensesFile } from "../controllers/file.controller.js";
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
 *     description: Filters by IST date range. employeeId can be a specific ID or "all".
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
 *         description: IST start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: IST end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       500: { description: Excel generation failed }
 */
router.get("/attendence", authenticateToken, getAttendanceFile)

/**
 * @swagger
 * /api/files/expenses:
 *   get:
 *     summary: Download expenses report as Excel
 *     description: Filters by IST date range. employeeId can be a specific ID or "all".
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
 *         description: IST start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: IST end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       500: { description: Excel generation failed }
 */
router.get("/expenses", authenticateToken, getExpensesFile)

export default router;