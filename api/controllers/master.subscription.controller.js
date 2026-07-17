import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const getMasterSubscriptions = async (req, res) => {
  try {
    const Role  = req?.user?.Role || req?.user?.role;

    if (!Role) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
      });
    }

    let sql = `
      SELECT
        ms.subscription_id AS SubscriptionId,
        ms.subscription_name AS SubscriptionName,
        ms.price AS Price,
        ms.duration_days AS DurationDays,
        ms.description AS Description,
        ms.is_recommended AS Recommended,
        ms.status AS Status,
        ms.created_at AS CreatedAt,
        ms.updated_at AS UpdatedAt
      FROM MasterSubscriptions ms
      WHERE 1=1
    `;

    const params = [];

    if (Role === "company") {
      sql += ` AND ms.status = ?`;
      params.push("ACTIVE");
    } else if (Role !== "admin") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Access denied",
      });
    }

    sql += `
      ORDER BY
        ms.is_recommended DESC,
        ms.price ASC
    `;

    const data = await query(sql, params);

    return apiResponse({
      res,
      success: true,
      message: "Subscriptions fetched successfully",
      data,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch subscriptions",
      error: err.message,
    });
  }
};

export const getSubscriptions = (req, res) => {
  return apiResponse({ res, message: "API is working..." });
};
