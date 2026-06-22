const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getLedgers = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { type, search } = req.query;
    let query = `SELECT l.*, g.name as group_name FROM ledgers l JOIN groups g ON l.group_id = g.id WHERE l.company_id = $1 AND l.is_active = true`;
    const params = [companyId];
    if (type) { query += ` AND l.ledger_type = $${params.length + 1}`; params.push(type); }
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
      city, state, pincode, gstin, pan, gst_registration_type,
      opening_balance, opening_balance_type
    } = req.body;
    if (!name || !group_id || !ledger_type)
      return errorResponse(res, 'Name, group and type are required');

    const result = await db.query(
      `INSERT INTO ledgers (company_id, group_id, name, ledger_type, phone, email, address, city, state, pincode, gstin, pan, gst_registration_type, opening_balance, opening_balance_type, current_balance, current_balance_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$14,$15) RETURNING *`,
      [companyId, group_id, name, ledger_type, phone, email, address, city, state,
       pincode, gstin, pan, gst_registration_type, opening_balance || 0, opening_balance_type || 'Dr']
    );
    return successResponse(res, result.rows[0], 'Ledger created', 201);
  } catch (err) { next(err); }
};

const updateLedger = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const {
      group_id, name, ledger_type, phone, email, address,
      city, state, pincode, gstin, pan, gst_registration_type
    } = req.body;
    const result = await db.query(
      `UPDATE ledgers SET group_id=$1, name=$2, ledger_type=$3, phone=$4, email=$5, address=$6, city=$7, state=$8, pincode=$9, gstin=$10, pan=$11, gst_registration_type=$12
       WHERE id=$13 AND company_id=$14 RETURNING *`,
      [group_id, name, ledger_type, phone, email, address, city, state,
       pincode, gstin, pan, gst_registration_type, id, companyId]
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