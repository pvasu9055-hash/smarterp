const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getUnits = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const result = await db.query(
      'SELECT * FROM units WHERE company_id = $1 ORDER BY symbol',
      [companyId]
    );
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const createUnit = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { symbol, formal_name } = req.body;
    if (!symbol) return errorResponse(res, 'Symbol is required');
    const result = await db.query(
      'INSERT INTO units (company_id, symbol, formal_name) VALUES ($1,$2,$3) RETURNING *',
      [companyId, symbol.toUpperCase(), formal_name]
    );
    return successResponse(res, result.rows[0], 'Unit created', 201);
  } catch (err) { next(err); }
};

const deleteUnit = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    await db.query(
      'DELETE FROM units WHERE id=$1 AND company_id=$2',
      [id, companyId]
    );
    return successResponse(res, null, 'Unit deleted');
  } catch (err) { next(err); }
};

module.exports = { getUnits, createUnit, deleteUnit };