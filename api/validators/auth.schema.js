import { z } from "zod";

export const createEmployeeSchema = z.object({
  CompanyId: z.coerce.number().int().positive(),

  EmployeeCode: z.string()
    .trim()
    .min(2, "EmployeeCode must be at least 2 characters")
    .max(20, "EmployeeCode cannot be longer than 20 characters"),

  FullName: z.string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, "FullName must contain only letters")
    .min(3, "FullName must be at least 3 characters")
    .max(100, "FullName cannot be longer than 100 characters"),

  MobileNo: z.string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "MobileNo must be a valid 10-digit mobile number"
    ),

  Email: z.string()
    .trim()
    .lowercase()
    .email("Invalid Email address"),

  Password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),

  Role: z.string()
    .trim()
    .optional()
    .default("employee"),
});

export const loginEmployeeSchema = z.object({
  MobileNo: z.string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "MobileNo must be a valid 10-digit mobile number"),

  Password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
});


export const updatePasswordSchema = z.object({
  oldPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  confirmPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
});