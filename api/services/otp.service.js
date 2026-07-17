import { query } from "../utils/dbQuery.js";
import { generateOtp, getOtpExpiry } from "../utils/generateOtp.js";
import {
  saveOtp,
  findValidOtp,
  markOtpUsed,
  countRecentOtps,
  incrementAttempts,
} from "../models/otp.model.js";
import { sendEmail } from "./sendEmail.js";
import { otpEmailTemplate } from "../utils/emailTemplates/otpTemplate.js";

const OTP_RATE_LIMIT = parseInt(process.env.OTP_RATE_LIMIT || "5");
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "5");

const ENTITY_CONFIG = {
  company: {
    table: "Companies",
    emailCol: "email",
    nameCol: "company_name",
    idCol: "company_id",
    verifyCol: "email_verified",
  },
  employee: {
    table: "Employees",
    emailCol: "email",
    nameCol: "full_name",
    idCol: "employee_id",
    verifyCol: "email_verified",
  },
};

const MOBILE_ENTITY_CONFIG = {
  company: { table: "Companies", idCol: "company_id" },
  employee: { table: "Employees", idCol: "employee_id" },
};

export const markMobileVerifiedService = async (entity_type, id) => {
  const config = MOBILE_ENTITY_CONFIG[entity_type];
  const rows = await query(
    `UPDATE ${config.table} SET mobile_verified = 1 WHERE ${config.idCol} = ?`,
    [id]
  );
  if (rows.affectedRows === 0) {
    const err = new Error(`${entity_type === "company" ? "Company" : "Employee"} not found`);
    err.statusCode = 404;
    throw err;
  }
  return { [config.idCol]: id, mobile_verified: true };
};

const findEntityByEmail = async (email, entityType) => {
  const { table, emailCol } = ENTITY_CONFIG[entityType];
  const rows = await query(
    `SELECT * FROM ${table} WHERE ${emailCol} = ? LIMIT 1`,
    [email.toLowerCase()]
  );
  return rows[0] || null;
};

export const sendOtpService = async (email, entityType) => {
  const config = ENTITY_CONFIG[entityType];
  if (!config) {
    const err = new Error("Invalid entity type");
    err.statusCode = 400;
    throw err;
  }

  const entity = await findEntityByEmail(email, entityType);
  if (!entity) {
    const err = new Error(`${entityType === "company" ? "Company" : "Employee"} not found`);
    err.statusCode = 404;
    throw err;
  }

  const recentCount = await countRecentOtps(email, entityType, 60);
  if (recentCount >= OTP_RATE_LIMIT) {
    const err = new Error("Too many OTP requests. Please try again after some time.");
    err.statusCode = 429;
    throw err;
  }

  const otp = generateOtp();
  const expiresAt = getOtpExpiry();

  await saveOtp(email, entityType, entity[config.idCol], otp, expiresAt);

  const html = otpEmailTemplate(otp, OTP_EXPIRY_MINUTES, entity[config.nameCol] || "");
  await sendEmail(email, "Your Verification OTP", html);

  return { email, expiresInMinutes: OTP_EXPIRY_MINUTES };
};

export const verifyOtpService = async (email, otp, entityType) => {
  const config = ENTITY_CONFIG[entityType];
  if (!config) {
    const err = new Error("Invalid entity type");
    err.statusCode = 400;
    throw err;
  }

  const entity = await findEntityByEmail(email, entityType);
  if (!entity) {
    const err = new Error(`${entityType === "company" ? "Company" : "Employee"} not found`);
    err.statusCode = 404;
    throw err;
  }

  // Find the latest unexpired unused record for attempt tracking (even if otp doesn't match yet)
  const latestRows = await query(
    `SELECT * FROM otp_verifications
     WHERE email = ? AND entity_type = ? AND used = 0 AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [email.toLowerCase(), entityType]
  );
  const latestRecord = latestRows[0] || null;

  if (!latestRecord) {
    const err = new Error("No active OTP found. Please request a new OTP.");
    err.statusCode = 400;
    throw err;
  }

  if (latestRecord.attempt_count >= OTP_MAX_ATTEMPTS) {
    const err = new Error("Maximum OTP attempts exceeded. Please request a new OTP.");
    err.statusCode = 429;
    throw err;
  }

  const otpRecord = await findValidOtp(email, entityType, otp);

  if (!otpRecord) {
    await incrementAttempts(latestRecord.id);
    const err = new Error("Invalid or expired OTP");
    err.statusCode = 400;
    throw err;
  }

  await markOtpUsed(otpRecord.id);

  await query(
    `UPDATE ${config.table} SET ${config.verifyCol} = 1 WHERE ${config.emailCol} = ?`,
    [email.toLowerCase()]
  );

  return {
    email,
    entityType,
    [config.idCol]: entity[config.idCol],
    emailVerified: true,
  };
};
