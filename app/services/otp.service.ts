import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export type EntityType = "company" | "employee";

export const sendEmailOtp = async (email: string, entity_type: EntityType) => {
  const { data } = await api.post(endpoints.otp.send, { email, entity_type });
  return data;
};

export const resendEmailOtp = async (email: string, entity_type: EntityType) => {
  const { data } = await api.post(endpoints.otp.resend, { email, entity_type });
  return data;
};

export const verifyEmailOtp = async (email: string, otp: string, entity_type: EntityType) => {
  const { data } = await api.post(endpoints.otp.verify, { email, otp, entity_type });
  return data;
};

export const markMobileVerified = async (userId: string, entity_type: EntityType) => {
  const payload =
    entity_type === "company"
      ? { CompanyId: Number(userId), entity_type }
      : { EmployeeId: Number(userId), entity_type };
  const { data } = await api.post(endpoints.otp.markMobileVerified, payload);
  return data;
};
