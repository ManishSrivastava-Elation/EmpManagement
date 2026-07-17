import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

// ─────────────────────────────────────────────────────────────────────────────
// createExpense
// Expenses columns: CompanyId, EmployeeId, Title, Description, Amount,
//                   ExpenseDate, ReceiptUrl (PascalCase — matches schema)
// Token: EmployeeId, CompanyId (from employee token)
// ─────────────────────────────────────────────────────────────────────────────
export const createExpense = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};
    const { Title, Description, Amount, Category } = req.body;

    if (!Title || !Amount) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Title and Amount are required",
      });
    }

    const ReceiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      `INSERT INTO Expenses (CompanyId, EmployeeId, Title, Description, Amount, ExpenseDate, Category, ReceiptUrl)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [
        CompanyId,
        EmployeeId,
        Title,
        Description ?? null,
        Amount,
        Category ?? null,
        ReceiptUrl,
      ],
    );

    return apiResponse({
      res,
      statusCode: 201,
      message: "Expense added successfully",
      data: { ExpenseId: result.insertId, ReceiptUrl },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to add expense",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getExpenses
// Expenses columns: CompanyId, EmployeeId, ExpenseDate, Amount, Status (PascalCase)
// Employees columns: employee_id, full_name (snake_case) — JOIN uses snake_case PK
// ─────────────────────────────────────────────────────────────────────────────
export const getExpenses = async (req, res) => {
  try {
    const EmployeeId = req.user?.employeeId || req.user?.EmployeeId;
    const CompanyId = req.user?.CompanyId || req.user?.companyId;
    const Role = req?.user?.Role || req?.user?.role;
    const {
      startDate,
      endDate,
      status,
      search,
      employee_id,
      sortBy,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    const allowedStatus = ["pending", "approved", "rejected", "paid"];
    if (status && !allowedStatus.includes(status)) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Invalid status",
      });
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Invalid startDate",
      });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Invalid endDate",
      });
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

    if (employee_id) {
      const clause = ` AND e.EmployeeId=?`;
      baseWhere += clause;
      dataWhere += clause;
      baseParams.push(employee_id);
      dataParams.push(employee_id);
    }

    // Status filter only on data query
    if (status) {
      dataWhere += ` AND e.Status=?`;
      dataParams.push(status);
    }

    const allowedSort = ["ExpenseDate", "Amount", "Status", "EmployeeName"];
    const allowedOrder = ["ASC", "DESC"];
    const finalSort = allowedSort.includes(sortBy) ? sortBy : "ExpenseDate";
    const finalOrder = allowedOrder.includes(String(order || "").toUpperCase())
      ? String(order || "").toUpperCase()
      : "DESC";

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
      ORDER BY ${finalSort === "EmployeeName" ? "emp.full_name" : finalSort === "ExpenseDate" ? "e.ExpenseDate" : finalSort === "Amount" ? "e.Amount" : "e.Status"} ${finalOrder}
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

// ─────────────────────────────────────────────────────────────────────────────
// getExpenseTypes
// Table: ExpenseTypes (not expense_types)
// Columns: id, name, status
// ─────────────────────────────────────────────────────────────────────────────
export const getExpenseTypes = async (req, res) => {
  try {
    const data = await query(
      "SELECT id, name FROM ExpenseTypes WHERE status = 'active' ORDER BY name ASC",
    );
    return apiResponse({
      res,
      message: "Expense types fetched successfully",
      data,
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch expense types",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// updateExpenseStatus
// Expenses columns: ExpenseId, CompanyId, Status (PascalCase)
// Valid statuses from schema: pending, approved, rejected, paid
// Role check: company role (not "admin")
// ─────────────────────────────────────────────────────────────────────────────
export const updateExpenseStatus = async (req, res) => {
  try {
    const { Role, CompanyId, companyId } = req.user || {};
    const { expenseId } = req.params;
    const { Status } = req.body;

    // Company role manages expenses (not superadmin "admin")
    const resolvedCompanyId = CompanyId || companyId;
    if (!resolvedCompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Only company can change expense status",
      });
    }

    const validStatuses = ["pending", "approved", "rejected", "paid"];
    if (!Status || !validStatuses.includes(Status.toLowerCase())) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message:
          "Invalid status value. Must be: pending, approved, rejected, paid",
      });
    }

    const existing = await query(
      "SELECT ExpenseId FROM Expenses WHERE ExpenseId = ? AND CompanyId = ?",
      [expenseId, resolvedCompanyId],
    );

    if (!existing.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Expense not found",
      });
    }

    await query(
      "UPDATE Expenses SET Status = ?, UpdatedAt = NOW() WHERE ExpenseId = ?",
      [Status.toLowerCase(), expenseId],
    );

    return apiResponse({ res, message: "Expense status updated successfully" });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to update status",
      error: err.message,
    });
  }
};
