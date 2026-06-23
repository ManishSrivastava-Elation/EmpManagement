import express from "express";
import { createEmployee, loginEmployee, updatePassword } from "../controllers/auth.controller.js";
import { validateZod } from "../middlewares/validateZod.js";
import { authenticateToken } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { createCompanySchema } from "../validators/company.schema.js";
import { createEmployeeSchema, loginEmployeeSchema, updatePasswordSchema } from "../validators/auth.schema.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Employee authentication
 */

/**
 * @swagger
 * /api/auth/create:
 *   post:
 *     summary: Create a new employee
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company_id, employee_code, full_name, mobile_no, email, password]
 *             properties:
 *               company_id: { type: integer }
 *               employee_code: { type: string }
 *               full_name: { type: string }
 *               mobile_no: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       201: { description: Employee created successfully }
 *       409: { description: Email already exists }
 */
router.post("/create", validateZod(createEmployeeSchema), createEmployee);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Employee login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier: { type: string, description: Email or mobile number }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns JWT token }
 *       401: { description: Invalid credentials }
 */
router.post("/login", validateZod(loginEmployeeSchema), loginEmployee);

/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     summary: Update employee password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword, confirmPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Password updated successfully }
 *       400: { description: Passwords do not match }
 *       401: { description: Old password incorrect }
 */
router.put("/update-password", authenticateToken, validateZod(updatePasswordSchema), updatePassword);

export default router;