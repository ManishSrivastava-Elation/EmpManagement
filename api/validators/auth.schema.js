import { z } from "zod";
import { onlyText, mobile, email, password } from "./common.schema.js";

export const createEmployeeSchema = z.object({
  company_id: z.coerce.number().int().positive(),
  employee_code: z.string()
    .trim()
    .min(2, "Employee code required")
    .max(20, "Employee code too long"),
  full_name: onlyText("Full name"),
  mobile_no: mobile("Mobile number"),
  email: email("Email"),
  password: password("Password"),
});


export const loginEmployeeSchema = z.object({
  identifier: z
    .string()
    .trim()
    .refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isMobile = /^[6-9]\d{9}$/.test(val);
      return isEmail || isMobile;
    }, "Enter valid email or mobile"),
  password: password("Password"),
});


export const updatePasswordSchema = z.object({
  oldPassword: password("Password"),
  newPassword: password("Password"),
  confirmPassword: password("Password"),
});