import { getActiveSubscription } from "../services/subscription.service.js";
import { apiResponse } from "../utils/response.js";

export const checkSubscription = async (req, res, next) => {
  try {
    // apne auth middleware ke according change kar lena
    const companyId = req.user?.companyId;
    const Role = req.user?.Role || req.user?.role;

    if (Role === "employee") {
      next();
      return;
    }

    if (!companyId) {
      return apiResponse({
        res,
        statusCode: 400,
        success: false,
        message: "Company ID not found",
        error: true,
      });
    }

    const subscription = await getActiveSubscription(companyId);
    console.log(JSON.stringify(subscription));

    if (!subscription) {
      return apiResponse({
        res,
        statusCode: 403,
        success: false,
        message: "No active subscription found",
        error: true,
      });
    }
    // optional → next APIs me use kar sakte ho
    req.subscription = subscription;

    next();
  } catch (err) {
    next(err);
  }
};
