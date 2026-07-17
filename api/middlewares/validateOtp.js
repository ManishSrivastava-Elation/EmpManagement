import { apiResponse } from "../utils/response.js";

/** Validates that entity_type is present and valid for send/resend routes */
export const validateEntityType = (req, res, next) => {
  const { entity_type } = req.body;
  if (!entity_type || !["company", "employee"].includes(entity_type)) {
    return apiResponse({
      res,
      success: false,
      statusCode: 400,
      message: "entity_type must be 'company' or 'employee'",
      error: true,
    });
  }
  next();
};
