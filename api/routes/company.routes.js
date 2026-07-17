import express from "express";
import { validateZod } from "../middlewares/validateZod.js";
import { authenticateToken } from "../middlewares/auth.js";
import { createCompanySchema, loginCompanySchema, updateCompanySchema } from "../validators/company.schema.js";
import { updatePasswordSchema } from "../validators/auth.schema.js";
import { 
  createCompany, 
  getCompanies, 
  getCompanyOptions, 
  loginCompany, 
  toggleCompanyStatus, 
  updateCompany, 
  verifyEmployeeByCompany,
  getCompanyProfile,
  updateCompanyPassword
} from "../controllers/company.controller.js";
import upload from "../middlewares/upload.js";
import { getCustomerOptions } from "../controllers/customer.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management
 */

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [company_name, password]
 *             properties:
 *               company_name: { type: string }
 *               password: { type: string }
 *               contact_person_name: { type: string }
 *               designation: { type: string }
 *               email: { type: string, format: email }
 *               mobile: { type: string }
 *               logo: { type: string, format: binary }
 *     responses:
 *       201: { description: Company created successfully }
 *       409: { description: Conflict - duplicate name/email/mobile }
 */
router.post("/", upload.single("logo"), validateZod(createCompanySchema), createCompany);

/**
 * @swagger
 * /api/companies/login:
 *   post:
 *     summary: Company login
 *     tags: [Companies]
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
router.post("/login", validateZod(loginCompanySchema), loginCompany);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Companies fetched successfully }
 */
router.get("/", authenticateToken, getCompanies);

/**
 * @swagger
 * /api/companies/options:
 *   get:
 *     summary: Get company options (id + name list)
 *     tags: [Companies]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Company options fetched successfully }
 */
router.get("/options", getCompanyOptions);
router.get("/customers/options", authenticateToken, getCustomerOptions);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               company_name: { type: string }
 *               contact_person_name: { type: string }
 *               designation: { type: string }
 *               email: { type: string }
 *               mobile: { type: string }
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *               logo: { type: string, format: binary }
 *     responses:
 *       200: { description: Company updated successfully }
 */
router.put("/password", authenticateToken, validateZod(updatePasswordSchema), updateCompanyPassword);
router.put("/:id", upload.single("logo"), authenticateToken, validateZod(updateCompanySchema), updateCompany);

/**
 * @swagger
 * /api/companies/{id}/toggle-status:
 *   patch:
 *     summary: Toggle company active/inactive status
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Status toggled successfully }
 *       404: { description: Company not found }
 */
router.patch("/:id/toggle-status", authenticateToken,  toggleCompanyStatus);

/**
 * @swagger
 * /api/companies/verify-employee:
 *   patch:
 *     summary: Verify an employee by company
 *     description: Marks an employee as verified (emp_verified = 1). Only the owning company can verify their own employees.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
 *             properties:
 *               employeeId: { type: integer, description: ID of the employee to verify }
 *     responses:
 *       200:
 *         description: Employee verified successfully
 *       400:
 *         description: Employee already verified or missing employeeId
 *       403:
 *         description: Forbidden - only company role or wrong company
 *       404:
 *         description: Employee not found
 */
router.patch( "/verify-employee", authenticateToken, verifyEmployeeByCompany );

/**
 * @swagger
 * /api/companies/profile:
 *   get:
 *     summary: Get authenticated company profile
 *     description: Returns the profile of the company derived from the JWT token.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company profile retrieved successfully
 *       401:
 *         description: Invalid token payload
 *       404:
 *         description: Company not found
 */
router.get("/profile", authenticateToken, getCompanyProfile);


export default router;