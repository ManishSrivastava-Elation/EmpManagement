import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { getMasterSubscriptions, getSubscriptions } from "../controllers/master.subscription.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MasterSubscriptions
 *   description: Subscription plan catalogue (admin and company access)
 */

/**
 * @swagger
 * /api/master-subscriptions:
 *   get:
 *     summary: Get all subscription plans
 *     description: Company role sees only ACTIVE plans; admin role sees all plans.
 *     tags: [MasterSubscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions fetched successfully
 *       401:
 *         description: Invalid token payload
 *       403:
 *         description: Access denied - only company or admin role
 *       500:
 *         description: Failed to fetch subscriptions
 */
router.get("/", authenticateToken, getMasterSubscriptions)

export default router;