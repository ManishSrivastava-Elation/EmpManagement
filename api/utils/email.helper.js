import { sendEmail } from "../services/sendEmail.js";
import { otpEmailTemplate } from "./emailTemplates/otpTemplate.js";

/**
 * Sends an OTP email using the branded template.
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {number} expiryMinutes - Expiry duration shown in email
 * @param {string} name - Entity name for personalisation
 */
export const sendOtpEmail = async (to, otp, expiryMinutes, name = "") => {
  const html = otpEmailTemplate(otp, expiryMinutes, name);
  await sendEmail(to, "Your Verification OTP", html);
};
