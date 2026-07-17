import { query } from "../utils/dbQuery.js";

export const getActiveSubscription = async (companyId) => {
  const rows = await query(
    `
    SELECT *
    FROM CompanySubscriptions
    WHERE company_id = ?
      AND status = 'ACTIVE'
      AND expires_at > NOW()
    ORDER BY expires_at DESC
    LIMIT 1
    `,
    [companyId]
  );

  return rows[0] || null;
};