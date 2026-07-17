import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { 
  getCompanySubscription, 
  purchaseSubscription, 
  getCurrentSubscription 
} from "../controllers/subscription.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Company subscription management
 */

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all subscriptions for the authenticated company
 *     description: Returns subscription history for the company derived from the JWT token.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, EXPIRED, CANCELLED] }
 *         description: Filter by subscription status
 *     responses:
 *       200:
 *         description: Company subscription fetched successfully
 *       401:
 *         description: Invalid token payload
 */
router.get("/", authenticateToken, getCompanySubscription);

/**
 * @swagger
 * /api/subscriptions/purchase:
 *   post:
 *     summary: Purchase a subscription plan
 *     description: Purchases a master subscription plan for the authenticated company. Fails if the company already has an active subscription.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subscriptionId]
 *             properties:
 *               subscriptionId: { type: integer, description: ID of the master subscription plan }
 *     responses:
 *       201:
 *         description: Subscription purchased successfully
 *       400:
 *         description: Missing subscriptionId or plan is not active
 *       401:
 *         description: Invalid token payload
 *       404:
 *         description: Company or subscription plan not found
 *       409:
 *         description: Company already has an active subscription
 */
router.post("/purchase", authenticateToken, purchaseSubscription);

/**
 * @swagger
 * /api/subscriptions/current:
 *   get:
 *     summary: Get the current active subscription
 *     description: Returns the single active subscription for the authenticated company, including days remaining.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscription retrieved successfully (data is null if none exists)
 *       401:
 *         description: Invalid token payload
 */
router.get("/current", authenticateToken, getCurrentSubscription);

export default router;