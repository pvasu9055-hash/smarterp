const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getCompanies = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM companies WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
      [req.user.id]
    );
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const createCompany = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode, gstin, pan, phone, email, financial_year_start, financial_year_end } = req.body;
    if (!name) return errorResponse(res, 'Company name is required');

    const count = await db.query(
      'SELECT COUNT(*) FROM companies WHERE user_id = $1 AND is_active = true',
      [req.user.id]
    );
    if (parseInt(count.rows[0].count) >= 5)
      return errorResponse(res, 'Maximum 5 companies allowed per account');

    const result = await db.query(
      `INSERT INTO companies (user_id, name, address, city, state, pincode, gstin, pan, phone, email, financial_year_start, financial_year_end)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user.id, name, address, city, state, pincode, gstin, pan, phone, email,
       financial_year_start || '2024-04-01', financial_year_end || '2025-03-31']
    );

    const company = result.rows[0];
    await db.query('SELECT seed_company_defaults($1)', [company.id]);

    return successResponse(res, company, 'Company created successfully', 201);
  } catch (err) { next(err); }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, city, state, pincode, gstin, pan, phone, email } = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$1, address=$2, city=$3, state=$4, pincode=$5, gstin=$6, pan=$7, phone=$8, email=$9
       WHERE id=$10 AND user_id=$11 RETURNING *`,
      [name, address, city, state, pincode, gstin, pan, phone, email, id, req.user.id]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Company not found', 404);
    return successResponse(res, result.rows[0], 'Company updated');
  } catch (err) { next(err); }
};

const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE companies SET is_active = false WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    return successResponse(res, null, 'Company deleted');
  } catch (err) { next(err); }
};

const selectCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM companies WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Company not found', 404);
    return successResponse(res, result.rows[0], 'Company selected');
  } catch (err) { next(err); }
};

module.exports = { getCompanies, createCompany, updateCompany, deleteCompany, selectCompany };