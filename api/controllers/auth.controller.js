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
      (company_id, full_name, mobile_no, email, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      data.company_id,
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
      error: true,
    });
  }
};


export const loginEmployee = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Email or mobile and password are required",
        error: true,
      });
    }

    const isMobile = /^[6-9]\d{9}$/.test(identifier);

    const users = await query(
      `SELECT * FROM Employees
       WHERE ${isMobile ? "mobile_no" : "email"} = ?`,
      [isMobile ? identifier : identifier.toLowerCase()],
    );

    if (!users.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
        error: true,
      });
    }

    const user = users[0];

    // Employee status check
    if (user.status && user.status.toLowerCase() === "inactive") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Employee is not active",
        error: true,
      });
    }

    // At least one verification required
    const isVerified =
      Boolean(user.email_verified) || Boolean(user.mobile_verified);

    if (!isVerified) {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Please verify email or mobile before login",
        data: {
          employee: {
            CompanyId: user.company_id,
            EmployeeId: user.employee_id,
            FullName: user.full_name,
            MobileNo: user.mobile_no,
            Email: user.email,
          },
        },
        error: true,
      });
    }

    // Employee verification check
    if (!Boolean(user.emp_verified)) {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Please wait for company approval before login",
        error: true,
      });
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
        error: true,
      });
    }

    const token = generateToken({
      EmployeeId: user.employee_id,
      CompanyId: user.company_id,
      Mobile: user.mobile_no,
      Email: user.email,
      Role: "employee"
    });

    return apiResponse({
      res,
      success: true,
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
    const { current_password, new_password, confirm_password } = req.body;

    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: true,
      });
    }

    if (current_password === new_password) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Old password and new password cannot be same",
        error: true,
      });
    }

    if (new_password !== confirm_password) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "New password and confirm password do not match",
        error: true,
      });
    }

    const users = await query(
      "SELECT password_hash FROM Employees WHERE employee_id = ? AND company_id = ?",
      [EmployeeId, CompanyId],
    );

    if (!users.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "User not found",
        error: true,
      });
    }

    const user = users[0];

    const isValid = await comparePassword(current_password, user.password_hash);

    if (!isValid) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Old password is incorrect",
        error: true,
      });
    }

    const hashedPassword = await hashPassword(new_password);

    await query(
      "UPDATE Employees SET password_hash = ? WHERE employee_id = ? AND company_id = ?",
      [hashedPassword, EmployeeId, CompanyId],
    );

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
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

export const getEmployeeProfile = async (req, res) => {
  try {
    const { EmployeeId } = req.user || {};

    if (!EmployeeId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload: employee session not verified",
        error: true,
      });
    }

    const rows = await query(
      `SELECT e.employee_id, e.company_id, e.employee_code, e.full_name, e.mobile_no, e.email, e.status, e.created_at, e.updated_at, c.company_name
       FROM Employees e
       INNER JOIN Companies c ON e.company_id = c.company_id
       WHERE e.employee_id = ?`,
      [EmployeeId]
    );

    if (!rows.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Employee not found",
        error: true,
      });
    }

    const emp = rows[0];
    const profileData = {
      id: emp.employee_id,
      name: emp.full_name,
      email: emp.email,
      phone: emp.mobile_no,
      employee_code: emp.employee_code,
      company_name: emp.company_name,
      profile_image: null,
      created_at: emp.created_at,
      updated_at: emp.updated_at,
    };

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Profile fetched successfully",
      data: profileData,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch employee profile",
      error: err.message,
    });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const { EmployeeId } = req.user || {};

    if (!EmployeeId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload: employee session not verified",
        error: true,
      });
    }

    const currentEmpRows = await query(
      "SELECT email, mobile_no, company_id FROM Employees WHERE employee_id = ?",
      [EmployeeId]
    );

    if (!currentEmpRows.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Employee not found",
        error: true,
      });
    }

    const currentEmp = currentEmpRows[0];

    if (email.toLowerCase() !== currentEmp.email.toLowerCase()) {
      const emailExists = await query(
        "SELECT employee_id FROM Employees WHERE email = ? AND employee_id != ?",
        [email.toLowerCase(), EmployeeId]
      );
      if (emailExists.length > 0) {
        return apiResponse({
          res,
          success: false,
          statusCode: 409,
          message: "Email is already taken by another employee",
          error: true,
        });
      }
    }

    if (phone.trim() !== currentEmp.mobile_no) {
      const phoneExists = await query(
        "SELECT employee_id FROM Employees WHERE mobile_no = ? AND employee_id != ?",
        [phone.trim(), EmployeeId]
      );
      if (phoneExists.length > 0) {
        return apiResponse({
          res,
          success: false,
          statusCode: 409,
          message: "Phone number is already taken by another employee",
          error: true,
        });
      }
    }

    await query(
      `UPDATE Employees 
       SET full_name = ?, email = ?, mobile_no = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE employee_id = ?`,
      [name.trim(), email.toLowerCase().trim(), phone.trim(), EmployeeId]
    );

    const updatedRows = await query(
      `SELECT e.employee_id, e.company_id, e.employee_code, e.full_name, e.mobile_no, e.email, e.status, e.created_at, e.updated_at, c.company_name
       FROM Employees e
       INNER JOIN Companies c ON e.company_id = c.company_id
       WHERE e.employee_id = ?`,
      [EmployeeId]
    );

    const emp = updatedRows[0];
    const profileData = {
      id: emp.employee_id,
      name: emp.full_name,
      email: emp.email,
      phone: emp.mobile_no,
      employee_code: emp.employee_code,
      company_name: emp.company_name,
      profile_image: null,
      created_at: emp.created_at,
      updated_at: emp.updated_at,
    };

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: profileData,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to update employee profile",
      error: err.message,
    });
  }
};

