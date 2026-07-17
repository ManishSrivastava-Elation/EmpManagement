import { query } from "../utils/dbQuery.js";

export const runMigrations = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      email        VARCHAR(255) NOT NULL,
      entity_type  ENUM('company', 'employee') NOT NULL,
      otp          VARCHAR(6) NOT NULL,
      expires_at   DATETIME NOT NULL,
      is_used      TINYINT(1) NOT NULL DEFAULT 0,
      created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email_entity (email, entity_type)
    )
  `);
  console.log("Migrations ran successfully");
};
