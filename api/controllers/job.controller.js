import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const createJob = async (req, res) => {
  try {
    const CompanyId = req.user?.companyId;
    const Role = req.user?.role;

    if (Role !== "company") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Only company can create jobs",
      });
    }

    const { customer_id, job_title, description, priority, due_date } =
      req.body;

    // Fetch Customer
    const customers = await query(
      `
      SELECT *
      FROM Customers
      WHERE id = ?
      AND company_id = ?
      LIMIT 1
      `,
      [customer_id, CompanyId],
    );

    if (!customers.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Customer not found",
      });
    }

    const customer = customers[0];

    const sql = `
        INSERT INTO Jobs
        (
            company_id,
            customer_id,

            customer_name,
            phone,
            alternate_phone,
            email,
            address_line1,
            address_line2,
            city,
            state,
            pincode,
            gstin_number,

            job_title,
            description,
            priority,
            due_date
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      CompanyId,
      customer.id,

      customer.customer_name,
      customer.phone,
      customer.alternate_phone,
      customer.email,
      customer.address_line1,
      customer.address_line2,
      customer.city,
      customer.state,
      customer.pincode,
      customer.gstin_number,

      job_title,
      description,
      priority,
      due_date,
    ]);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Job created successfully",
      data: {
        job_id: result.insertId,
      },
    });
  } catch (err) {
    const statusCode = err.name === "ZodError" ? 400 : 500;

    return apiResponse({
      res,
      success: false,
      statusCode,
      message: err.message || "Job creation failed",
      error: true,
    });
  }
};


export const getJobDetails = async (req, res) => {
  try {
    const CompanyId  = req.user?.companyId  || req.user?.CompanyId;
    const EmployeeId = req.user?.employeeId || req.user?.EmployeeId;
    const Role       = req.user?.role       || req.user?.Role;

    if (Role !== "company" && Role !== "employee") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Access denied" });
    }

    const jobId = parseInt(req.params.id);
    if (!jobId || isNaN(jobId)) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Invalid job ID" });
    }

    // For employee: fetch job only if assigned to them
    // For company: fetch any job belonging to their company
    let sql = `
      SELECT
         j.id              AS job_id,
         j.job_title,
         j.description,
         j.priority,
         j.status,
         j.due_date,
         j.created_at,
         j.updated_at,

         c.id              AS customer_id,
         c.customer_name,
         c.phone           AS customer_phone,
         c.alternate_phone,
         c.email           AS customer_email,
         c.address_line1,
         c.address_line2,
         c.city,
         c.state,
         c.pincode,
         c.gstin_number,

         e.employee_id     AS emp_id,
         e.full_name       AS emp_name,
         e.mobile_no       AS emp_phone,
         e.email           AS emp_email

       FROM Jobs j
       INNER JOIN Customers c ON j.customer_id = c.id
       LEFT JOIN job_assignments ja ON ja.job_id = j.id AND ja.status = 'ASSIGNED'
       LEFT JOIN Employees e ON e.employee_id = ja.employee_id
       WHERE j.id = ? AND j.company_id = ?`;

    const params = [jobId, CompanyId];

    if (Role === "employee") {
      sql += ` AND ja.employee_id = ?`;
      params.push(EmployeeId);
    }

    sql += ` LIMIT 1`;

    const rows = await query(sql, params);

    if (!rows.length) {
      return apiResponse({
        res, success: false,
        statusCode: Role === "employee" ? 403 : 404,
        message: Role === "employee" ? "Access denied" : "Job not found",
      });
    }

    const r = rows[0];

    return apiResponse({
      res,
      statusCode: 200,
      message: "Job details fetched successfully",
      data: {
        job: {
          id:          r.job_id,
          job_title:   r.job_title,
          description: r.description,
          priority:    r.priority,
          status:      r.status,
          due_date:    r.due_date,
          created_at:  r.created_at,
          updated_at:  r.updated_at,
        },
        customer: {
          id:             r.customer_id,
          customer_name:  r.customer_name,
          phone:          r.customer_phone,
          alternate_phone: r.alternate_phone,
          email:          r.customer_email,
          address_line1:  r.address_line1,
          address_line2:  r.address_line2,
          city:           r.city,
          state:          r.state,
          pincode:        r.pincode,
          gstin_number:   r.gstin_number,
        },
        employee: r.emp_id ? {
          id:            r.emp_id,
          employee_name: r.emp_name,
          phone:         r.emp_phone,
          email:         r.emp_email,
        } : null,
      },
    });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to fetch job details", error: err.message });
  }
};

export const assignJob = async (req, res) => {
  try {
    const CompanyId = req.user?.companyId;
    const Role = req.user?.role;

    if (Role !== "company") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Only company can assign jobs",
      });
    }

    const { job_id, employee_id } = req.body;

    // Check Job
    const jobs = await query(
      `SELECT id, status FROM Jobs WHERE id = ? AND company_id = ? LIMIT 1`,
      [job_id, CompanyId],
    );

    if (!jobs.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Job not found" });
    }

    // Check Employee
    const employees = await query(
      `SELECT employee_id, status FROM Employees WHERE employee_id = ? AND company_id = ? LIMIT 1`,
      [employee_id, CompanyId],
    );

    if (!employees.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Employee not found" });
    }

    if (employees[0].status !== "ACTIVE") {
      return apiResponse({ res, success: false, statusCode: 400, message: "Employee is inactive" });
    }

    // Check existing assignment
    const existing = await query(
      `SELECT id FROM job_assignments WHERE job_id = ? AND status = 'ASSIGNED' LIMIT 1`,
      [job_id],
    );

    let result;
    let message;

    if (existing.length) {
      // Reassign: update existing assignment + keep job status as ASSIGNED
      await query(
        `UPDATE job_assignments SET employee_id = ?, updated_at = NOW() WHERE id = ?`,
        [employee_id, existing[0].id],
      );
      await query(
        `UPDATE Jobs SET status = 'ASSIGNED', updated_at = NOW() WHERE id = ?`,
        [job_id],
      );
      result = { assignment_id: existing[0].id };
      message = "Job reassigned successfully";
    } else {
      // New assignment
      const ins = await query(
        `INSERT INTO job_assignments (job_id, employee_id, company_id) VALUES (?, ?, ?)`,
        [job_id, employee_id, CompanyId],
      );
      await query(
        `UPDATE Jobs SET status = 'ASSIGNED', updated_at = NOW() WHERE id = ?`,
        [job_id],
      );
      result = { assignment_id: ins.insertId };
      message = "Job assigned successfully";
    }

    return apiResponse({ res, statusCode: 201, message, data: result });
  } catch (err) {
    const statusCode = err.name === "ZodError" ? 400 : 500;
    return apiResponse({ res, success: false, statusCode, message: err.message || "Failed to assign job", error: true });
  }
};


export const getAllJobs = async (req, res) => {
  try {
    const Role      = req?.user?.role      || req?.user?.Role;
    const CompanyId = req?.user?.companyId || req?.user?.CompanyId;

    const EmployeeId = req?.user?.employeeId || req?.user?.EmployeeId;

    if (!Role || (Role !== "company" && Role !== "superadmin" && Role !== "employee")) {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Access denied",
      });
    }

    const {
      search,
      priority,
      status,
      customer_id,
      dueDateFrom,
      dueDateTo,
      startDate,
      endDate,
      sortBy = "created_at",
      order  = "DESC",
    } = req.query;

    const allowedSort  = ["id", "job_title", "priority", "due_date", "created_at"];
    const allowedOrder = ["ASC", "DESC"];
    const finalSort    = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const finalOrder   = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

    const isEmployee = Role === "employee";

    let sql = `
      SELECT
        j.id,
        j.company_id,
        j.customer_id,
        j.customer_name,
        j.phone,
        j.alternate_phone,
        j.email,
        j.address_line1,
        j.address_line2,
        j.city,
        j.state,
        j.pincode,
        j.gstin_number,
        j.job_title,
        j.description,
        j.priority,
        j.due_date,
        j.status,
        j.created_at,
        j.updated_at
      FROM Jobs j
      ${isEmployee ? "INNER JOIN job_assignments ja ON ja.job_id = j.id AND ja.status = 'ASSIGNED'" : ""}
      WHERE 1=1
    `;

    const params = [];

    // Role scoping
    if (Role === "company") {
      sql += ` AND j.company_id = ?`;
      params.push(CompanyId);
    } else if (isEmployee) {
      sql += ` AND j.company_id = ? AND ja.employee_id = ?`;
      params.push(CompanyId, EmployeeId);
    }

    // Search filter
    if (search && search.trim()) {
      sql += ` AND (j.job_title LIKE ? OR j.customer_name LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }

    // Priority filter
    if (priority && priority.trim()) {
      let pVal = priority.trim().toUpperCase();
      if (pVal === "CRITICAL") pVal = "URGENT";
      sql += ` AND j.priority = ?`;
      params.push(pVal);
    }

    // Status filter
    if (status && status.trim()) {
      sql += ` AND j.status = ?`;
      params.push(status.trim());
    }

    // Customer filter
    if (customer_id) {
      sql += ` AND j.customer_id = ?`;
      params.push(customer_id);
    }

    // Due Date range filter
    const startD = dueDateFrom || startDate;
    const endD = dueDateTo || endDate;
    if (startD && endD) {
      sql += ` AND DATE(j.due_date) BETWEEN ? AND ?`;
      params.push(startD, endD);
    } else if (startD) {
      sql += ` AND DATE(j.due_date) >= ?`;
      params.push(startD);
    } else if (endD) {
      sql += ` AND DATE(j.due_date) <= ?`;
      params.push(endD);
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(req.query.page  ?? "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "10")));
    const offset   = (pageNum - 1) * limitNum;

    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, "SELECT COUNT(*) AS total FROM");

    if (finalSort === "priority") {
      sql += ` ORDER BY FIELD(j.priority, 'LOW', 'MEDIUM', 'HIGH', 'URGENT') ${finalOrder} LIMIT ? OFFSET ?`;
    } else {
      sql += ` ORDER BY j.${finalSort} ${finalOrder} LIMIT ? OFFSET ?`;
    }

    const [data, [countRow]] = await Promise.all([
      query(sql, [...params, limitNum, offset]),
      query(countSql, params),
    ]);

    const total      = Number(countRow?.total || 0);
    const totalPages = Math.ceil(total / limitNum);

    return apiResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Jobs fetched successfully",
      data,
      meta: {
        page:        pageNum,
        limit:       limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch jobs",
      error: err.message,
    });
  }
};

