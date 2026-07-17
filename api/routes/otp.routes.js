import express from "express";
import rateLimit from "express-rate-limit";
import { validateZod } from "../middlewares/validateZod.js";
import { sendOtpSchema, verifyOtpSchema, markMobileVerifiedSchema } from "../validators/otp.schema.js";
import { sendOtp, verifyOtp, resendOtp, markMobileVerified } from "../controllers/otp.controller.js";

const router = express.Router();

/** IP-level rate limiter: max 10 requests per 15 minutes per IP */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
    data: [],
    error: true,
  },
});

/**
 * @swagger
 * tags:
 *   name: OTP
 *   description: OTP send, verify and resend for company and employee
 */

/**
 * @swagger
 * /api/otp/send:
 *   post:
 *     summary: Send OTP to email
 *     tags: [OTP]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, entity_type]
 *             properties:
 *               email: { type: string, format: email }
 *               entity_type: { type: string, enum: [company, employee] }
 *     responses:
 *       200: { description: OTP sent successfully }
 *       404: { description: Company/Employee not found }
 *       429: { description: Too many OTP requests }
 */
router.post("/send", otpLimiter, validateZod(sendOtpSchema), sendOtp);

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [OTP]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, entity_type]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, minLength: 6, maxLength: 6 }
 *               entity_type: { type: string, enum: [company, employee] }
 *     responses:
 *       200: { description: OTP verified successfully }
 *       400: { description: Invalid or expired OTP }
 *       404: { description: Company/Employee not found }
 */
router.post("/verify", otpLimiter, validateZod(verifyOtpSchema), verifyOtp);

/**
 * @swagger
 * /api/otp/resend:
 *   post:
 *     summary: Resend OTP (invalidates previous OTP)
 *     tags: [OTP]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, entity_type]
 *             properties:
 *               email: { type: string, format: email }
 *               entity_type: { type: string, enum: [company, employee] }
 *     responses:
 *       200: { description: OTP resent successfully }
 *       429: { description: Too many OTP requests }
 */
router.post("/resend", otpLimiter, validateZod(sendOtpSchema), resendOtp);

/**
 * @swagger
 * /api/otp/mark-mobile-verified:
 *   post:
 *     summary: Mark mobile number as verified
 *     description: Directly marks the mobile number as verified for a company or employee. Requires either CompanyId or EmployeeId depending on entity_type.
 *     tags: [OTP]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entity_type]
 *             properties:
 *               entity_type: { type: string, enum: [company, employee] }
 *               CompanyId: { type: integer, description: Required when entity_type is company }
 *               EmployeeId: { type: integer, description: Required when entity_type is employee }
 *     responses:
 *       200:
 *         description: Mobile marked as verified
 *       400:
 *         description: Validation error - missing CompanyId or EmployeeId
 *       404:
 *         description: Company/Employee not found
 */
router.post("/mark-mobile-verified", validateZod(markMobileVerifiedSchema), markMobileVerified);

export default router;
