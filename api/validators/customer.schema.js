import { z } from "zod";
import { onlyText, optionalText, mobile, email, } from "./common.schema.js";

export const createCustomerSchema = z.object({
  customer_name: onlyText("Customer name"),
  phone: mobile("Phone").refine((v) => v !== null, {
    message: "Phone is required",
  }),
  alternate_phone: mobile("Alternate phone"),
  email: email("Email"),
  address_line1: z
    .string()
    .trim()
    .min(2, "Address line 1 is required")
    .max(255),
    
  address_line2: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),

  city: onlyText("City"),

  state: onlyText("State"),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Invalid pincode")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),

  gstin_number: z
    .string()
    .trim()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Invalid GSTIN"
    )
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.toUpperCase() : null)),
});