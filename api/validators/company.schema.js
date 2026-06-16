import { z } from "zod";
import { mobile, onlyText, email, password, booleanFlag } from "./common.schema.js";

export const createCompanySchema = z.object({
    company_name: onlyText("Company name"),
    contact_person_name: onlyText("Contact person name"),
    designation: onlyText("Designation", 100),
    email: email("Email"),
    mobile: mobile("Mobile Number"),
    email_verified: booleanFlag("Email verified"),
    mobile_verified: booleanFlag("Mobile verified"),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    password: password("Password"),
});


export const loginCompanySchema = z.object({
    email: email("Email"),
    password: password("Password"),
});