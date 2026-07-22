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
 *               Category: { type: string }
 *               ReceiptUrl: { type: string, format: binary }
 *     responses:
 *       201: { description: Expense added successfully }
 *       400: { description: Title and Amount are required }
 *       500: { description: Failed to add expense }
 */
router.post("/", authenticateToken, upload.single("ReceiptUrl"), createExpense);

/**
 * @swagger
 * /api/expense:
 *   get:
 *     summary: Get expenses
 *     description: Employee sees own expenses; company sees all company expenses.
 *     tags: [Expenses]
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
 *         schema: { type: string, enum: [pending, approved, rejected, paid] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by employee name, title, or description
 *       - in: query
 *         name: employee_id
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [ExpenseDate, Amount, Status, EmployeeName], default: ExpenseDate }
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
 *       200: { description: Expenses fetched successfully with pagination and status counts }
 *       400: { description: Invalid status or date }
 *       500: { description: Failed to fetch expenses }
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
 *     summary: Update expense status (company role)
 *     description: Only company role can update expense status.
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
 *       200: { description: Expense status updated successfully }
 *       400: { description: Invalid status value }
 *       403: { description: Only company can change expense status }
 *       404: { description: Expense not found }
 *       500: { description: Failed to update status }
 */
router.patch("/:expenseId", authenticateToken, updateExpenseStatus);

export default router;
