import express from "express";
import { getAllEmployees, updateEmployeeStatus, getEmployeeOptions } from "../controllers/employee.controller.js";
import { getEmployeeProfile, updateEmployeeProfile, updatePassword } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import { checkSubscription } from "../middlewares/checkSubscription.middleware.js";
import { validateZod } from "../middlewares/validateZod.js";
import { updateEmployeeProfileSchema, updatePasswordSchema } from "../validators/auth.schema.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management (company/admin access)
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     description: Returns a paginated list of employees. Company role sees only their own employees; superadmin sees all.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE] }
 *         description: Filter by employee status
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, employee code, or email
 *       - in: query
 *         name: employee_id
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [employee_id, company_id, employee_code, full_name, email, status, created_at], default: created_at }
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
 *       200:
 *         description: Employees fetched successfully with pagination meta
 *       403:
 *         description: Access denied
 *       500:
 *         description: Failed to fetch employees
 */
router.get("/", authenticateToken, getAllEmployees);

/**
 * @swagger
 * /api/employees/{id}/status:
 *   patch:
 *     summary: Update employee status
 *     description: Allows a company to activate or deactivate one of their employees.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: Employee status updated
 *       400:
 *         description: Invalid status value or missing fields
 *       403:
 *         description: Forbidden - only company role allowed or wrong company
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to update employee status
 */
router.patch('/:id/status', authenticateToken, updateEmployeeStatus);

/**
 * @swagger
 * /api/employees/options:
 *   get:
 *     summary: Get active employee options
 *     description: Returns a lightweight list of active employees for dropdowns. Only company role allowed.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by employee name
 *       - in: query
 *         name: phone
 *         schema: { type: string }
 *         description: Search by mobile number
 *     responses:
 *       200:
 *         description: Employee options fetched (max 20 results)
 *       403:
 *         description: Access denied - only company role
 *       500:
 *         description: Failed to fetch employee options
 */
router.get('/options', authenticateToken, getEmployeeOptions);

/**
 * @swagger
 * /api/employees/profile:
 *   get:
 *     summary: Get authenticated employee profile
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Profile fetched successfully }
 *       401: { description: Invalid token payload }
 *       404: { description: Employee not found }
 */
router.get("/profile", authenticateToken, getEmployeeProfile);

/**
 * @swagger
 * /api/employees/profile:
 *   put:
 *     summary: Update authenticated employee profile
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Profile updated successfully }
 *       401: { description: Invalid token payload }
 *       404: { description: Employee not found }
 *       409: { description: Email or phone already taken }
 *       500: { description: Failed to update employee profile }
 */
router.put("/profile", authenticateToken, validateZod(updateEmployeeProfileSchema), updateEmployeeProfile);

/**
 * @swagger
 * /api/employees/password:
 *   put:
 *     summary: Update employee password
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password, confirm_password]
 *             properties:
 *               current_password: { type: string }
 *               new_password: { type: string }
 *               confirm_password: { type: string }
 *     responses:
 *       200: { description: Password updated successfully }
 *       400: { description: Old and new password same, or passwords do not match }
 *       401: { description: Old password incorrect or invalid token }
 *       404: { description: Employee not found }
 */
router.put("/password", authenticateToken, validateZod(updatePasswordSchema), updatePassword);

export default router;