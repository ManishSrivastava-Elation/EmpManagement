import { apiResponse } from "../utils/response.js";

export const validateAttendanceStatus = (req, res, next) => {
  const { status } = req.body;

  const allowedStatus = ["pending", "approved", "rejected"];

  if (!status) {
    return apiResponse({
      res,
      success: false,
      statusCode: 400,
      message: "Status is required",
      error: [
        {
          field: "status",
          message: "Status field is required",
        },
      ],
    });
  }

  if (!allowedStatus.includes(status)) {
    return apiResponse({
      res,
      success: false,
      statusCode: 400,
      message: "Invalid status",
      error: [
        {
          field: "status",
          message: `Allowed values: ${allowedStatus.join(", ")}`,
        },
      ],
    });
  }

  next();
};