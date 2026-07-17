import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import { testConnection } from "./config/db.js";
import companyRoutes from "./routes/company.routes.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import fileRouter from "./routes/file.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import upload from "./middlewares/upload.js";
import masterSubscriptionRoutes from "./routes/master.subscriptio.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import jobRoutes from "./routes/job.route.js";
import { apiResponse } from "./utils/response.js";
import { startSubscriptionExpiryCron } from "./cron/subscriptionExpiry.cron.js";

const app = express();
dotenv.config();
startSubscriptionExpiryCron();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload route
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  res.json({
    success: true,
    message: "Image uploaded successfully",
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
    },
  });
});

// Swagger UI
// process.env.NODE_ENV === "development" && app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/api/companies", companyRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/files", fileRouter);
app.use("/api/otp", otpRoutes);
app.use("/api/master-subscription", masterSubscriptionRoutes);
app.use("/api/company/subscription", subscriptionRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/job", jobRoutes);

// Api testing route
app.get("/api", (req, res) => {
  return apiResponse({ res, message: "API is working..." });
});

// 404 - Not Found handler
app.use((req, res) => {
  return apiResponse({
    res,
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.listen(PORT, async () => {
  // console.log(`Server is running on port: http://localhost:${PORT}`);
  console.log(`Server is running.`);
  await testConnection();
});
