import { randomInt } from "crypto";

/**
 * Generates a cryptographically secure 6-digit OTP
 * Uses Node's crypto.randomInt instead of Math.random (not secure)
 */
export const generateOtp = () => {
  return randomInt(100000, 999999).toString();
};

/**
 * Returns OTP expiry timestamp
 * @param {number} minutes - configurable via OTP_EXPIRY_MINUTES env
 */
export const getOtpExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
  return new Date(Date.now() + minutes * 60 * 1000);
};
