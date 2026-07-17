import cron from "node-cron";
import { query } from "../utils/dbQuery.js";

export const startSubscriptionExpiryCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Checking expired subscriptions...");

      const sql = `
        UPDATE CompanySubscriptions
        SET
          status = 'EXPIRED',
          updated_at = CURRENT_TIMESTAMP
        WHERE
          status = 'ACTIVE'
          AND expires_at <= NOW()
      `;

      const result = await query(sql);

      console.log(
        `${result.affectedRows || 0} subscriptions expired`
      );

    } catch (err) {
      console.error(
        "Subscription cron failed:",
        err.message
      );
    }
  });
};