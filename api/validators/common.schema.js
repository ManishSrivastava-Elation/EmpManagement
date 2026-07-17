import { z } from "zod";

const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

export const onlyText = (field) =>
    z.string()
        .trim()
        .min(2, `${field} required`)
        .max(200, `${field} too long`)
        .refine((val) => /^[A-Za-z .'-]+$/.test(val), {
            message: `${field} must contain only letters`,
        });

export const optionalText = (field, max = 100) =>
    z.string()
        .trim()
        .max(max)
        .refine((val) => /^[A-Za-z .'-]*$/.test(val), {
            message: `${field} must contain only letters`,
        })
        .optional()
        .or(z.literal(""))
        .transform((v) => (v ? v : null));

export const dateTime = (field) =>
    z.preprocess(
        (value) => {
            if (value === "" || value === null || value === undefined) return undefined;
            if (typeof value === "string") return value.trim();
            return value;
        },
        z.string({
            required_error: `${field} is required`,
            invalid_type_error: `${field} must be a valid datetime`,
        }).refine((val) => isoDateTimeRegex.test(val) && !Number.isNaN(Date.parse(val)), {
            message: `${field} must be valid ISO or MySQL datetime`,
        })
    );

export const requiredNumber = (field, min, max) =>
    z.preprocess(
        (value) => {
            if (value === "" || value === null || value === undefined) return undefined;
            return value;
        },
        z.coerce.number({
            required_error: `${field} is required`,
            invalid_type_error: `${field} must be a number`,
        })
            .min(min, `${field} must be >= ${min}`)
            .max(max, `${field} must be <= ${max}`)
    );

export const mobile = () =>
    z.string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Invalid mobile number")
        .optional()
        .or(z.literal(""))
        .transform((v) => (v ? v : null));

export const email = () =>
    z.string()
        .trim()
        .email("Invalid email")
        .optional()
        .or(z.literal(""))
        .transform((v) => (v ? v.toLowerCase() : null));

export const password = (field) =>
    z.string()
        .min(8, `${field}  must be at least 8 characters`)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            `${field} must contain uppercase, lowercase, number and special character`
        );

export const booleanFlag = (field) =>
    z.coerce
        .boolean({
            invalid_type_error: `${field} must be a boolean`,
        })
        .default(false);