import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { createExpense, getExpenses, updateExpenseStatus, getExpenseTypes } from "../controllers/expense.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management
 */

/**
 * @swagger
 * /api/expense:
 *   post:
 *     summary: Create an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [Title, Amount]
 *             properties:
 *               Title: { type: string }
 *               Amount: { type: number }
 *               Description: { type: string }
 *               ReceiptUrl: { type: string, format: binary }
 *     responses:
 *       201: { description: Expense added successfully }
 */
router.post("/", authenticateToken, upload.single("ReceiptUrl"), createExpense);

/**
 * @swagger
 * /api/expense:
 *   get:
 *     summary: Get expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Expenses fetched successfully }
 */
router.get("/", authenticateToken, getExpenses);

/**
 * @swagger
 * /api/expense/types:
 *   get:
 *     summary: Get expense types
 *     tags: [Expenses]
 *     security: []
 *     responses:
 *       200: { description: Expense types fetched successfully }
 */
router.get("/types", getExpenseTypes);

/**
 * @swagger
 * /api/expense/{expenseId}:
 *   patch:
 *     summary: Update expense status (admin only)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
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
 *               Status: { type: string, enum: [pending, approved, rejected, paid] }
 *     responses:
 *       200: { description: Expense status updated }
 *       403: { description: Forbidden }
 */
router.patch("/:expenseId", authenticateToken, updateExpenseStatus);

export default router;
