import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const createExpense = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};
    const { Title, Description, Amount } = req.body;

    if (!Title || !Amount) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Title and Amount are required" });
    }

    const ReceiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      `INSERT INTO Expenses (CompanyId, EmployeeId, Title, Description, Amount, ExpenseDate, ReceiptUrl)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`,
      [CompanyId, EmployeeId, Title, Description ?? null, Amount, ReceiptUrl]
    );

    return apiResponse({ res, statusCode: 201, message: "Expense added successfully", data: { ExpenseId: result.insertId, ReceiptUrl } });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to add expense", error: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { EmployeeId, CompanyId, Role } = req.user || {};
    const { startDate, endDate, status, search, page = 1, limit = 10 } = req.query;

    const allowedStatus = ["pending", "approved", "rejected", "paid"];
    if (status && !allowedStatus.includes(status)) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Invalid status" });
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Invalid startDate" });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Invalid endDate" });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Base WHERE — used for counts (no status filter)
    let baseWhere = ` WHERE 1=1`;
    const baseParams = [];

    // Data WHERE — includes status filter
    let dataWhere = ` WHERE 1=1`;
    const dataParams = [];

    const addFilter = (clause, ...vals) => {
      baseWhere += clause;
      dataWhere += clause;
      baseParams.push(...vals);
      dataParams.push(...vals);
    };

    // Role filter
    if (Role === "employee") {
      addFilter(` AND e.EmployeeId=? AND e.CompanyId=?`, EmployeeId, CompanyId);
    } else if (Role === "company") {
      addFilter(` AND e.CompanyId=?`, CompanyId);
    }

    // Date range
    if (startDate && endDate) {
      addFilter(` AND DATE(e.ExpenseDate) BETWEEN ? AND ?`, startDate, endDate);
    } else if (startDate) {
      addFilter(` AND DATE(e.ExpenseDate) >= ?`, startDate);
    } else if (endDate) {
      addFilter(` AND DATE(e.ExpenseDate) <= ?`, endDate);
    }

    // Search (employee name, title, description)
    if (search && search.trim()) {
      const like = `%${search.trim()}%`;
      const clause = ` AND (emp.full_name LIKE ? OR e.Title LIKE ? OR e.Description LIKE ?)`;
      baseWhere += clause;
      dataWhere += clause;
      baseParams.push(like, like, like);
      dataParams.push(like, like, like);
    }

    // Status filter only on data query
    if (status) {
      dataWhere += ` AND e.Status=?`;
      dataParams.push(status);
    }

    const dataSql = `
      SELECT
        e.ExpenseId,
        CONVERT_TZ(e.ExpenseDate, '+00:00', '+05:30') AS ExpenseDate,
        e.EmployeeId,
        e.Amount,
        e.ReceiptUrl,
        emp.full_name AS EmployeeName,
        e.Title,
        e.Description,
        e.Status
      FROM Expenses e
      INNER JOIN Employees emp ON e.EmployeeId = emp.employee_id
      ${dataWhere}
      ORDER BY e.ExpenseId DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT
        COUNT(*) AS total,
        SUM(e.Status='pending') AS pending,
        SUM(e.Status='approved') AS approved,
        SUM(e.Status='rejected') AS rejected,
        SUM(e.Status='paid') AS paid
      FROM Expenses e
      INNER JOIN Employees emp ON e.EmployeeId = emp.employee_id
      ${baseWhere}
    `;

    const [data, countResult] = await Promise.all([
      query(dataSql, [...dataParams, limitNum, offset]),
      query(countSql, baseParams),
    ]);

    const { total, pending, approved, rejected, paid } = countResult[0];
    const totalNum = Number(total || 0);
    const totalPages = Math.ceil(totalNum / limitNum);

    return apiResponse({
      res,
      message: "Expenses fetched successfully",
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: totalNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        pending: Number(pending || 0),
        approved: Number(approved || 0),
        rejected: Number(rejected || 0),
        paid: Number(paid || 0),
      },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch expenses",
      error: err.message,
    });
  }
};

export const getExpenseTypes = async (req, res) => {
  try {
    const data = await query("SELECT id, name FROM ExpenseTypes WHERE status = 'active' ORDER BY name ASC");
    return apiResponse({ res, message: "Expense types fetched successfully", data });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to fetch expense types", error: err.message });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const { Role, CompanyId } = req.user || {};
    const { expenseId } = req.params;
    const { Status } = req.body;

    if (Role !== "company") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Only company admin can change expense status" });
    }

    const validStatuses = ["pending", "approved", "rejected", "paid"];
    if (!validStatuses.includes(Status)) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Invalid status value" });
    }

    const existing = await query(
      "SELECT ExpenseId FROM Expenses WHERE ExpenseId = ? AND CompanyId = ?",
      [expenseId, CompanyId]
    );

    if (!existing.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Expense not found" });
    }

    await query("UPDATE Expenses SET Status = ? WHERE ExpenseId = ?", [Status, expenseId]);

    return apiResponse({ res, message: "Expense status updated successfully" });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to update status", error: err.message });
  }
};
