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
router.get("/attendence", authenticateToken, getAttendanceFile)

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

export default router;