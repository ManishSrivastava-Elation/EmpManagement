import { query } from "../utils/dbQuery.js";

/** Invalidate old OTPs and insert a new one */
export const saveOtp = async (email, entityType, entityId, otp, expiresAt) => {
  await query(
    `UPDATE otp_verifications SET used = 1
     WHERE email = ? AND entity_type = ? AND used = 0`,
    [email, entityType]
  );

  return query(
    `INSERT INTO otp_verifications (entity_type, entity_id, email, otp, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [entityType, entityId, email, otp, expiresAt]
  );
};

/** Find a valid (unexpired, unused) OTP record */
export const findValidOtp = async (email, entityType, otp) => {
  const rows = await query(
    `SELECT * FROM otp_verifications
     WHERE email = ? AND entity_type = ? AND otp = ?
       AND used = 0 AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [email, entityType, otp]
  );
  return rows[0] || null;
};

/** Increment attempt_count; returns updated count */
export const incrementAttempts = async (id) => {
  await query(
    `UPDATE otp_verifications SET attempt_count = attempt_count + 1 WHERE id = ?`,
    [id]
  );
  const rows = await query(
    `SELECT attempt_count FROM otp_verifications WHERE id = ?`,
    [id]
  );
  return rows[0]?.attempt_count || 0;
};

/** Mark OTP as used and verified */
export const markOtpUsed = async (id) => {
  return query(
    `UPDATE otp_verifications SET used = 1, verified = 1 WHERE id = ?`,
    [id]
  );
};

/** Count OTPs sent to an email in the last N minutes (rate limit) */
export const countRecentOtps = async (email, entityType, withinMinutes = 60) => {
  const rows = await query(
    `SELECT COUNT(*) AS total FROM otp_verifications
     WHERE email = ? AND entity_type = ?
       AND created_at >= NOW() - INTERVAL ? MINUTE`,
    [email, entityType, withinMinutes]
  );
  return rows[0]?.total || 0;
};
