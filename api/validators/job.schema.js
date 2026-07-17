import { z } from "zod";
import {
  onlyText,
  requiredNumber,
  dateTime,
} from "./common.schema.js";

export const createJobSchema = z.object({
  customer_id: requiredNumber("Customer", 1, Number.MAX_SAFE_INTEGER),

  job_title: z
    .string()
    .trim()
    .min(2, "Job title is required")
    .max(255),

  description: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .default("MEDIUM"),

  due_date: dateTime("Due date"),
});


export const assignJobSchema = z.object({
  job_id: requiredNumber("Job", 1, Number.MAX_SAFE_INTEGER),
  employee_id: requiredNumber("Employee", 1, Number.MAX_SAFE_INTEGER),
});