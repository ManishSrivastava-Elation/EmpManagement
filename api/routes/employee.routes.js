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
 *         description: Employees fetched successfully
 *       403:
 *         description: Access denied
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
 *         description: Invalid status value
 *       403:
 *         description: Forbidden - only company role allowed
 *       404:
 *         description: Employee not found
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
 *         description: Employee options fetched
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get('/options', authenticateToken, getEmployeeOptions);

router.get("/profile", authenticateToken, getEmployeeProfile);
router.put("/profile", authenticateToken, validateZod(updateEmployeeProfileSchema), updateEmployeeProfile);
router.put("/password", authenticateToken, validateZod(updatePasswordSchema), updatePassword);

export default router;