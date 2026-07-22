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
 *       400: { description: Email or mobile and password are required }
 *       401: { description: Invalid credentials }
 *       403: { description: Company not active or not verified }
 *       404: { description: Company not found }
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
 *         description: Search by company name
 *       - in: query
 *         name: company_id
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [company_id, company_name, created_at, status], default: created_at }
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
 *       200: { description: Companies fetched successfully with pagination meta }
 *       500: { description: Internal server error }
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
 *         description: Search by company name
 *     responses:
 *       200: { description: Company options fetched successfully }
 *       500: { description: Internal server error }
 */
router.get("/options", getCompanyOptions);

/**
 * @swagger
 * /api/companies/customers/options:
 *   get:
 *     summary: Get customer options for the authenticated company
 *     description: Returns lightweight customer list (id + name) for dropdowns. Only company role allowed.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by customer name or phone
 *     responses:
 *       200: { description: Customer options fetched successfully }
 *       403: { description: Only company can fetch customer options }
 *       500: { description: Internal server error }
 */
router.get("/customers/options", authenticateToken, getCustomerOptions);

/**
 * @swagger
 * /api/companies/password:
 *   put:
 *     summary: Update company password
 *     tags: [Companies]
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
 *       404: { description: Company not found }
 */
router.put("/password", authenticateToken, validateZod(updatePasswordSchema), updateCompanyPassword);

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
 *               email_verified: { type: integer, enum: [0, 1] }
 *               mobile_verified: { type: integer, enum: [0, 1] }
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *               logo: { type: string, format: binary }
 *     responses:
 *       200: { description: Company updated successfully }
 *       500: { description: Internal server error }
 */
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