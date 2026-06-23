const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getLedgers = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { type, search } = req.query;
    let query = `SELECT l.*, l.type as ledger_type, l.mobile as phone, l.balance_type as current_balance_type, l.opening_balance as current_balance, g.name as group_name FROM ledgers l JOIN groups g ON l.group_id = g.id WHERE l.company_id = $1 AND l.is_active = true`;
    const params = [companyId];
    if (type) { query += ` AND l.type = $${params.length + 1}`; params.push(type); }
    if (search) { query += ` AND l.name ILIKE $${params.length + 1}`; params.push(`%${search}%`); }
    query += ` ORDER BY l.name`;
    const result = await db.query(query, params);
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const getLedger = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const result = await db.query(
      `SELECT l.*, g.name as group_name FROM ledgers l JOIN groups g ON l.group_id = g.id WHERE l.id = $1 AND l.company_id = $2`,
      [id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Ledger not found', 404);
    return successResponse(res, result.rows[0]);
  } catch (err) { next(err); }
};

const createLedger = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const {
      group_id, name, ledger_type, phone, email, address,
      city, state, pincode, gstin, pan,
      opening_balance, opening_balance_type
    } = req.body;
    if (!name || !group_id || !ledger_type)
      return errorResponse(res, 'Name, group and type are required');

    const result = await db.query(
      `INSERT INTO ledgers (company_id, group_id, name, type, mobile, address, city, state, pincode, gstin, pan, opening_balance, balance_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [companyId, group_id, name, ledger_type, phone, address, city, state,
       pincode, gstin, pan, opening_balance || 0, opening_balance_type || 'Dr']
    );
    return successResponse(res, result.rows[0], 'Ledger created', 201);
  } catch (err) { next(err); }
};

const updateLedger = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const {
      group_id, name, ledger_type, phone, email, address,
      city, state, pincode, gstin, pan
    } = req.body;
    const result = await db.query(
      `UPDATE ledgers SET group_id=$1, name=$2, type=$3, mobile=$4, address=$5, city=$6, state=$7, pincode=$8, gstin=$9, pan=$10
       WHERE id=$11 AND company_id=$12 RETURNING *`,
      [group_id, name, ledger_type, phone, address, city, state,
       pincode, gstin, pan, id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Ledger not found', 404);
    return successResponse(res, result.rows[0], 'Ledger updated');
  } catch (err) { next(err); }
};

const deleteLedger = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    await db.query(
      'UPDATE ledgers SET is_active = false WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    return successResponse(res, null, 'Ledger deleted');
  } catch (err) { next(err); }
};

module.exports = { getLedgers, getLedger, createLedger, updateLedger, deleteLedger };