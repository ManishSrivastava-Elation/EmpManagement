import { apiResponse } from "../utils/response.js";
import { sendOtpService, verifyOtpService, markMobileVerifiedService } from "../services/otp.service.js";

export const sendOtp = async (req, res) => {
  try {
    const { email, entity_type } = req.body; 

    const data = await sendOtpService(email, entity_type);

    return apiResponse({
      res,
      statusCode: 200,
      message: `OTP sent successfully to ${email}`,
      data,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: err.statusCode || 500,
      message: err.message || "Failed to send OTP",
      error: true,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, entity_type } = req.body;

    const data = await verifyOtpService(email, otp, entity_type);

    return apiResponse({
      res,
      statusCode: 200,
      message: "OTP verified successfully",
      data,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: err.statusCode || 500,
      message: err.message || "OTP verification failed",
      error: true,
    });
  }
};


export const markMobileVerified = async (req, res) => {
  try {
    const { entity_type, EmployeeId, CompanyId } = req.body;
    const id = entity_type === "employee" ? EmployeeId : CompanyId;
    const data = await markMobileVerifiedService(entity_type, id);
    return apiResponse({ res, statusCode: 200, message: "Mobile verified successfully", data });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: err.statusCode || 500, message: err.message || "Failed to mark mobile as verified", error: true });
  }
};

export const resendOtp = async (req, res) => { 
  try {
    const { email, entity_type } = req.body;

    const data = await sendOtpService(email, entity_type);

    return apiResponse({
      res,
      statusCode: 200,
      message: `OTP resent successfully to ${email}`,
      data,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: err.statusCode || 500,
      message: err.message || "Failed to resend OTP",
      error: true,
    });
  }
};
