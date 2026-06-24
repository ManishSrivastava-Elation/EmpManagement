import express from "express";
import { getDashboardStats, getExpenseByType } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/dashboard/stats", authenticateToken, getDashboardStats);
router.get("/dashboard/expense-by-type", authenticateToken, getExpenseByType);

export default router;
