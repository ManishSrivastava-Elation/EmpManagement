import { z } from "zod";
import { onlyText, mobile, email, password } from "./common.schema.js";

export const createEmployeeSchema = z.object({
  company_id: z.coerce.number().int().positive(),
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


export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: password("New password"),
    confirm_password: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New password and confirm password do not match",
    path: ["confirm_password"],
  });

export const updateEmployeeProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email format"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
});