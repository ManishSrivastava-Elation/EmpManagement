import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Enter a valid email address")
    .toLowerCase(),
  entity_type: z.enum(["company", "employee"], {
    required_error: "entity_type is required",
    message: "entity_type must be 'company' or 'employee'",
  }),
});

export const markMobileVerifiedSchema = z.object({
  entity_type: z.enum(["company", "employee"], {
    required_error: "entity_type is required",
    message: "entity_type must be 'company' or 'employee'",
  }),
  EmployeeId: z.number({ coerce: true }).int().positive().optional(),
  CompanyId: z.number({ coerce: true }).int().positive().optional(),
}).refine(
  (data) =>
    (data.entity_type === "employee" && data.EmployeeId) ||
    (data.entity_type === "company" && data.CompanyId),
  { message: "Provide EmployeeId for employee or CompanyId for company" }
);

export const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Enter a valid email address")
    .toLowerCase(),
  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
  entity_type: z.enum(["company", "employee"], {
    required_error: "entity_type is required",
    message: "entity_type must be 'company' or 'employee'",
  }),
});
