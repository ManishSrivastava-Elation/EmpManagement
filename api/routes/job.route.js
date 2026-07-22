import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { validateZod } from "../middlewares/validateZod.js";
import { createCustomer } from "../controllers/customer.controller.js";
import { assignJobSchema, createJobSchema } from "../validators/job.schema.js";
import { assignJob, createJob, getAllJobs, getJobDetails } from "../controllers/job.controller.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management
 */

/**
 * @swagger
 * /api/job/create:
 *   post:
 *     summary: Create a new job
 *     description: Create a job for an existing customer. Only company role allowed.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - job_title
 *             properties:
 *               customer_id:
 *                 type: integer
 *                 example: 12
 *               job_title:
 *                 type: string
 *                 example: AC Installation
 *               description:
 *                 type: string
 *                 example: Install 2 Ton Split AC
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 example: HIGH
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-07-05T10:00:00
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only company can create jobs
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.post( "/create", authenticateToken, validateZod(createJobSchema), createJob); 


/**
 * @swagger
 * /api/job/list:
 *   get:
 *     summary: Get all jobs
 *     description: Company sees own jobs; superadmin sees all; employee sees only assigned jobs.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by job title or customer name
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: customer_id
 *         schema: { type: integer }
 *       - in: query
 *         name: dueDateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dueDateTo
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [id, job_title, priority, due_date, created_at], default: created_at }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *     responses:
 *       200:
 *         description: Jobs fetched successfully with pagination meta
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get("/list", authenticateToken, getAllJobs);


/**
 * @swagger
 * /api/job/assign:
 *   post:
 *     summary: Assign job to an employee
 *     description: Assign a job to one employee. A job can have only one active assignment.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_id
 *               - employee_id
 *             properties:
 *               job_id:
 *                 type: integer
 *                 example: 25
 *               employee_id:
 *                 type: integer
 *                 example: 8
 *     responses:
 *       201:
 *         description: Job assigned successfully
 *       400:
 *         description: Validation failed or employee inactive
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only company can assign jobs
 *       404:
 *         description: Job or employee not found
 *       409:
 *         description: Job already assigned
 *       500:
 *         description: Internal server error
 */
router.post( "/assign", authenticateToken, validateZod(assignJobSchema), assignJob);

/**
 * @swagger
 * /api/job/details/{id}:
 *   get:
 *     summary: Get job details by ID
 *     description: Returns full job info including customer and assigned employee. Company sees any of their jobs; employee sees only assigned jobs.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details fetched successfully
 *       400:
 *         description: Invalid job ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.get("/details/:id", authenticateToken, getJobDetails);

export default router;