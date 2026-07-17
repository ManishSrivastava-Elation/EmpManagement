import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const getCompanySubscription = async (req, res) => {
  try {
    const { CompanyId } = req.user || {};

    if (!CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: [
          {
            field: "Authorization",
            message: "Token must include CompanyId",
          },
        ],
      });
    }

    const { status } = req.query;

    let sql = `
      SELECT
        cs.company_subscription_id AS CompanySubscriptionId,
        cs.company_id AS CompanyId,
        c.company_name AS CompanyName,

        cs.subscription_id AS SubscriptionId,
        ms.subscription_name AS SubscriptionName,
        ms.description AS Description,

        ms.price AS OriginalPrice,
        cs.purchased_price AS PurchasedPrice,

        ms.duration_days AS DurationDays,
        ms.is_recommended AS IsRecommended,

        cs.starts_at AS StartsAt,
        cs.expires_at AS ExpiresAt,

        cs.status AS Status,

        DATEDIFF(cs.expires_at, NOW()) AS RemainingDays,

        cs.created_at AS PurchasedAt,
        cs.updated_at AS UpdatedAt

      FROM CompanySubscriptions cs
      INNER JOIN Companies c
        ON cs.company_id = c.company_id

      INNER JOIN MasterSubscriptions ms
        ON cs.subscription_id = ms.subscription_id

      WHERE cs.company_id = ?
    `;

    const params = [CompanyId];

    if (status) {
      sql += ` AND cs.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY cs.company_subscription_id DESC`;

    const data = await query(sql, params);

    return apiResponse({
      res,
      success: true,
      message: "Company subscription fetched successfully",
      data,
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch company subscription",
      error: err.message,
    });
  }
};

export const purchaseSubscription = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.CompanyId;
    const { subscriptionId } = req.body;

    if (!companyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload: company session not verified",
        data: null,
        error: true,
        meta: null
      });
    }

    if (!subscriptionId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "subscriptionId is required",
        data: null,
        error: true,
        meta: null
      });
    }

    // Validate company exists
    const companies = await query(
      `SELECT company_id, status FROM Companies WHERE company_id = ?`,
      [companyId]
    );
    if (!companies.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Company not found",
        data: null,
        error: true,
        meta: null
      });
    }

    // Validate subscription exists
    const subscriptions = await query(
      `SELECT subscription_id, price, duration_days, status FROM MasterSubscriptions WHERE subscription_id = ?`,
      [subscriptionId]
    );
    if (!subscriptions.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Subscription plan not found",
        data: null,
        error: true,
        meta: null
      });
    }

    const subscription = subscriptions[0];

    // Validate subscription ACTIVE
    if (subscription.status !== "ACTIVE") {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Subscription plan is not active",
        data: null,
        error: true,
        meta: null
      });
    }

    // Check existing active subscription
    const activeSubscriptions = await query(
      `SELECT company_subscription_id FROM CompanySubscriptions WHERE company_id = ? AND status = 'ACTIVE'`,
      [companyId]
    );

    if (activeSubscriptions.length > 0) {
      return apiResponse({
        res,
        success: false,
        statusCode: 409,
        message: "Company already has active subscription",
        data: null,
        error: true,
        meta: null
      });
    }

    // Purchase logic
    const purchased_price = subscription.price;
    const duration_days = subscription.duration_days;

    const result = await query(
      `INSERT INTO CompanySubscriptions 
       (company_id, subscription_id, purchased_price, starts_at, expires_at, status) 
       VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'ACTIVE')`,
      [companyId, subscriptionId, purchased_price, duration_days]
    );

    const [newSub] = await query(
      `SELECT company_subscription_id, company_id, subscription_id, starts_at, expires_at, status 
       FROM CompanySubscriptions WHERE company_subscription_id = ?`,
      [result.insertId]
    );

    return apiResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Subscription purchased successfully",
      data: {
        companySubscriptionId: newSub.company_subscription_id,
        companyId: newSub.company_id,
        subscriptionId: newSub.subscription_id,
        startsAt: newSub.starts_at,
        expiresAt: newSub.expires_at,
        status: newSub.status
      },
      error: false,
      meta: null
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 400,
      message: err.message || "Subscription purchase failed",
      data: null,
      error: true,
      meta: null
    });
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.CompanyId;

    if (!companyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload: company session not verified",
        error: true
      });
    }

    const sql = `
      SELECT 
        ms.subscription_name AS subscriptionName,
        cs.purchased_price AS purchasedPrice,
        cs.starts_at AS startsAt,
        cs.expires_at AS expiresAt,
        GREATEST(0, DATEDIFF(cs.expires_at, NOW())) AS daysLeft,
        cs.status AS status
      FROM CompanySubscriptions cs
      INNER JOIN MasterSubscriptions ms 
        ON cs.subscription_id = ms.subscription_id
      WHERE cs.company_id = ? AND cs.status = 'ACTIVE'
      ORDER BY cs.company_subscription_id DESC
      LIMIT 1
    `;

    const rows = await query(sql, [companyId]);

    if (!rows.length) {
      return apiResponse({
        res,
        success: true,
        statusCode: 200,
        message: "No active subscription found",
        data: null
      });
    }

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Active subscription retrieved successfully",
      data: rows[0]
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch current subscription",
      error: err.message
    });
  }
};