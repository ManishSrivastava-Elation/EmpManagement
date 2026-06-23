import { query } from "../utils/dbQuery.js";
import { hashPassword, comparePassword } from "../services/password.service.js";
import { generateToken } from "../services/jwt.service.js";
import { apiResponse } from "../utils/response.js";
import { validateUnique } from "../validators/custom.validators.js";
import { log } from "console";

export const createEmployee = async (req, res) => {
  try {
    const data = req.body;

    // Check email uniqueness
    await validateUnique({
      table: "Employees",
      column: "email",
      value: data.email,
    });

    const sql = `
      INSERT INTO Employees
      (company_id, employee_code, full_name, mobile_no, email, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      data.company_id,
      data.employee_code,
      data.full_name,
      data.mobile_no,
      data.email,
      await hashPassword(data.password),
    ]);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Employee created successfully",
      data: {
        employee_id: result.insertId,
      },
    });

  } catch (err) {
    const statusCode =
      err.name === "ZodError"
        ? 400
        : err.message?.includes("already exists")
          ? 409
          : 500;

    return apiResponse({
      res,
      success: false,
      statusCode,
      message: err.message || "Employee creation failed",
    });
  }
};


export const loginEmployee = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const isMobile = /^[6-9]\d{9}$/.test(identifier);

    const users = await query(
      `SELECT * FROM Employees 
       WHERE ${isMobile ? "mobile_no" : "email"} = ?`,
      [isMobile ? identifier : identifier.toLowerCase()]
    );

    if (!users.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      EmployeeId: user.employee_id,
      CompanyId: user.company_id,
      Mobile: user.mobile_no,
      Email: user.email,
      Role: "employee",
    });

    return apiResponse({
      res,
      message: "Login successful",
      data: {
        token,
        employee: {
          CompanyId: user.company_id,
          EmployeeId: user.employee_id,
          FullName: user.full_name,
          MobileNo: user.mobile_no,
          Email: user.email,
        },
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Login failed",
      error: err.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
      });
    }

    if (oldPassword === newPassword) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Old password and new password cannot be same",
      });
    }

    if (newPassword !== confirmPassword) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "New password and confirm password do not match",
      });
    }

    const users = await query(
      "SELECT password_hash FROM Employees WHERE employee_id = ? AND company_id = ?",
      [EmployeeId, CompanyId]
    );

    if (!users.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    const user = users[0];

    const isValid = await comparePassword(oldPassword, user.password_hash);

    if (!isValid) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await query(
      "UPDATE Employees SET password_hash = ? WHERE employee_id = ? AND company_id = ?",
      [hashedPassword, EmployeeId, CompanyId]
    );

    return apiResponse({
      res,
      message: "Password updated successfully",
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to update password",
      error: err.message,
    });
  }
};