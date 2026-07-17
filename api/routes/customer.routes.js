import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { validateZod } from "../middlewares/validateZod.js";
import { createCustomerSchema } from "../validators/customer.schema.js";
import { createCustomer, getAllCustomers } from "../controllers/customer.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/customer/create:
 *   post:
 *     summary: Create a new customer
 *     description: Only company users can create customers.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - phone
 *               - address_line1
 *               - city
 *               - state
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: ABC Industries
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               alternate_phone:
 *                 type: string
 *                 example: "9876543211"
 *               email:
 *                 type: string
 *                 example: abc@gmail.com
 *               address_line1:
 *                 type: string
 *                 example: Sector 10
 *               address_line2:
 *                 type: string
 *                 example: Near SBI Bank
 *               city:
 *                 type: string
 *                 example: Lucknow
 *               state:
 *                 type: string
 *                 example: Uttar Pradesh
 *               pincode:
 *                 type: string
 *                 example: "226010"
 *               gstin_number:
 *                 type: string
 *                 example: 09ABCDE1234F1Z5
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only company can create customers
 *       409:
 *         description: Phone/Email/GSTIN already exists
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateToken, validateZod(createCustomerSchema), createCustomer);

/**
 * @swagger
 * /api/customer:
 *   get:
 *     summary: Get all customers
 *     description: Company users see only their own customers. Superadmin sees all.
 *     tags:
 *       - Customers
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
 *         description: Search by name, phone, email, GSTIN, or city
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: created_at }
 *         description: "Allowed: id, customer_name, phone, email, city, state, created_at"
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *     responses:
 *       200:
 *         description: Customers fetched successfully
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateToken, getAllCustomers);


export default router;