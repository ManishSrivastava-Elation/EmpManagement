import express from "express";
import { validateZod } from "../middlewares/validateZod.js";
import { authenticateToken } from "../middlewares/auth.js";
import { createCompanySchema, loginCompanySchema } from "../validators/company.schema.js";
import { createCompany, getCompanies, getCompanyOptions, loginCompany, toggleCompanyStatus, updateCompany } from "../controllers/company.controller.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("logo"), validateZod(createCompanySchema), createCompany);
router.post("/login", validateZod(loginCompanySchema), loginCompany);
router.get("/", authenticateToken, getCompanies);
router.get("/options", getCompanyOptions);
router.put("/:id", upload.single("logo"), authenticateToken, validateZod(createCompanySchema), updateCompany);
router.patch("/:id/toggle-status", authenticateToken,  toggleCompanyStatus);

export default router;