import { z } from "zod";

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