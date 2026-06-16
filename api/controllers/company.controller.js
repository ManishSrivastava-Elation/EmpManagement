import { query } from "../utils/dbQuery.js";
import { hashPassword, comparePassword } from "../services/password.service.js";
import { generateToken } from "../services/jwt.service.js";
import { apiResponse } from "../utils/response.js";
import { validateUnique } from "../validators/custom.validators.js";

export const createCompany = async (req, res) => {
    try {

        const body = req.body;

        const logoUrl = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const hashedPassword = await hashPassword(body.password);

        await validateUnique({
            table: "Companies",
            column: "company_name",
            value: body.company_name,
        });

        if (body.email) {
            await validateUnique({
                table: "Companies",
                column: "email",
                value: body.email,
            });
        }

        if (body.mobile) {
            await validateUnique({
                table: "Companies",
                column: "mobile",
                value: body.mobile,
            });
        }

        const values = [
            body.company_name,
            logoUrl,
            body.contact_person_name || null,
            body.designation || null,
            body.email || null,
            body.mobile || null,
            hashedPassword,
            body.email_verified ? 1 : 0,
            body.mobile_verified ? 1 : 0,
            body.status || "ACTIVE",
        ];

        const sql = `
      INSERT INTO Companies (
        company_name,
        logo_url,
        contact_person_name,
        designation,
        email,
        mobile,
        password,
        email_verified,
        mobile_verified,
        status
      )
      VALUES (${values.map(() => "?").join(", ")})
    `;

        const result = await query(sql, values);

        return apiResponse({
            res,
            statusCode: 201,
            message: "Company created successfully",
            data: {
                company_id: result.insertId,
                logo_url: logoUrl,
            },
        });

    } catch (err) {
        return apiResponse({
            res,
            success: false,
            statusCode: err.message?.includes("exists") ? 409 : 500,
            message: err.message,
        });
    }
};

export const loginCompany = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return apiResponse({
                res,
                success: false,
                statusCode: 400,
                message: "Email and password are required",
            });
        }

        const rows = await query(
            `SELECT * FROM Companies WHERE email = ?`,
            [email]
        );

        if (!rows.length) {
            return apiResponse({
                res,
                success: false,
                statusCode: 404,
                message: "Company not found",
            });
        }

        const company = rows[0];

        const isMatch = await comparePassword(password, company.password);

        if (!isMatch) {
            return apiResponse({
                res,
                success: false,
                statusCode: 401,
                message: "Invalid credentials",
            });
        }

        const token = generateToken({
            companyId: company.company_id,
            email: company.email,
            role: "COMPANY",
        });

        return apiResponse({
            res,
            message: "Login successful",
            data: {
                token,
                company: {
                    company_id: company.company_id,
                    company_name: company.company_name,
                    email: company.email,
                    mobile: company.mobile,
                    status: company.status,
                },
            },
        });

    } catch (err) {
        return apiResponse({
            res,
            success: false,
            statusCode: 500,
            message: err.message,
        });
    }
};


export const getCompanies = async (req, res) => {
    try {
        const {
            company_id,
            status,
            search,
            sortBy = "created_at",
            order = "DESC",
            page = 1,
            limit = 10,
        } = req.query;

        const offset = (page - 1) * limit;

        let sql = `SELECT * FROM Companies WHERE 1=1`;
        let countSql = `SELECT COUNT(*) as total FROM Companies WHERE 1=1`;

        const params = [];
        const countParams = [];

        if (company_id) {
            sql += ` AND company_id = ?`;
            countSql += ` AND company_id = ?`;
            params.push(company_id);
            countParams.push(company_id);
        }

        if (status) {
            sql += ` AND status = ?`;
            countSql += ` AND status = ?`;
            params.push(status);
            countParams.push(status);
        }

        if (search) {
            sql += ` AND company_name LIKE ?`;
            countSql += ` AND company_name LIKE ?`;
            params.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        const allowedSortFields = [
            "company_id",
            "company_name",
            "created_at",
            "status",
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : "created_at";

        const safeOrder =
            order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

        sql += ` ORDER BY ${safeSortBy} ${safeOrder}`;

        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const rows = await query(sql, params);
        const safeRows = rows.map(({ password, ...rest }) => rest);
        const totalResult = await query(countSql, countParams);
        const total = totalResult[0]?.total || 0;

        return apiResponse({
            res,
            message: "Companies fetched successfully",
            data: safeRows,
            meta: {
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit),
                },
            },
        });

    } catch (err) {
        return apiResponse({
            res,
            success: false,
            statusCode: 500,
            message: err.message,
        });
    }
};


export const updateCompany = async (req, res) => {
    try {

        const { id } = req.params;
        const data = req.body;

        const logoUrl = req.file
            ? `/uploads/${req.file.filename}`
            : data.logo_url || null;

        const sql = `
      UPDATE Companies
      SET
        company_name=?,
        logo_url=?,
        contact_person_name=?,
        designation=?,
        email=?,
        mobile=?,
        email_verified=?,
        mobile_verified=?,
        status=?
      WHERE company_id=?
    `;

        await query(sql, [
            data.company_name ?? null,
            logoUrl,
            data.contact_person_name ?? null,
            data.designation ?? null,
            data.email ?? null,
            data.mobile ?? null,
            data.email_verified ?? 0,
            data.mobile_verified ?? 0,
            data.status ?? "ACTIVE",
            id,
        ]);

        return apiResponse({
            res,
            message: "Company updated successfully",
            data: {
                company_id: id,
                logo_url: logoUrl,
            },
        });

    } catch (err) {
        return apiResponse({
            res,
            success: false,
            statusCode: 500,
            message: err.message,
        });
    }
};


export const toggleCompanyStatus = async (req, res) => {
    try {

        const { id } = req.params;

        const rows = await query(
            `SELECT status FROM Companies WHERE company_id=?`,
            [id]
        );

        if (!rows.length) {
            return apiResponse({
                res,
                success: false,
                statusCode: 404,
                message: "Company not found",
            });
        }

        const currentStatus = rows[0].status;

        const newStatus =
            currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        await query(
            `UPDATE Companies SET status=? WHERE company_id=?`,
            [newStatus, id]
        );

        return apiResponse({
            res,
            message: `Company marked ${newStatus.toLowerCase()}`,
            data: {
                company_id: id,
                status: newStatus,
            },
        });

    } catch (err) {
        return apiResponse({
            res,
            success: false,
            statusCode: 500,
            message: err.message,
        });
    }
};