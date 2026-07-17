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
 *     description: Returns all master subscription plans. Company role sees only ACTIVE plans; admin sees all.
 *     tags: [MasterSubscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions fetched successfully
 *       401:
 *         description: Invalid token payload
 *       403:
 *         description: Access denied
 */
router.get("/", authenticateToken, getMasterSubscriptions)

export default router;