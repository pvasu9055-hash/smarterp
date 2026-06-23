const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getStockItems = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { search } = req.query;
    let query = `SELECT s.*, u.symbol as unit_symbol FROM stock_items s LEFT JOIN units u ON s.unit_id = u.id WHERE s.company_id = $1 AND s.is_active = true`;
    const params = [companyId];
    if (search) { query += ` AND s.name ILIKE $${params.length + 1}`; params.push(`%${search}%`); }
    query += ` ORDER BY s.name`;
    const result = await db.query(query, params);
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const getStockItem = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const result = await db.query(
      `SELECT s.*, u.symbol as unit_symbol FROM stock_items s LEFT JOIN units u ON s.unit_id = u.id WHERE s.id = $1 AND s.company_id = $2`,
      [id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Stock item not found', 404);
    return successResponse(res, result.rows[0]);
  } catch (err) { next(err); }
};

const createStockItem = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { unit_id, name, sku, purchase_rate, sale_rate, gst_rate, opening_stock, minimum_quantity, hsn_code } = req.body;
    if (!name) return errorResponse(res, 'Item name is required');
    const result = await db.query(
      `INSERT INTO stock_items (company_id, unit_id, name, sku, purchase_rate, sale_rate, gst_rate, opening_stock, current_stock, minimum_quantity, hsn_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10) RETURNING *`,
      [companyId, unit_id || null, name, sku, purchase_rate || 0, sale_rate || 0, gst_rate || 0, opening_stock || 0, minimum_quantity || 0, hsn_code || null]
    );
    return successResponse(res, result.rows[0], 'Stock item created', 201);
  } catch (err) { next(err); }
};

const updateStockItem = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const { unit_id, name, sku, purchase_rate, sale_rate, gst_rate, minimum_quantity, hsn_code } = req.body;
    const result = await db.query(
      `UPDATE stock_items SET unit_id=$1, name=$2, sku=$3, purchase_rate=$4, sale_rate=$5, gst_rate=$6, minimum_quantity=$7, hsn_code=$8 WHERE id=$9 AND company_id=$10 RETURNING *`,
      [unit_id || null, name, sku, purchase_rate, sale_rate, gst_rate, minimum_quantity, hsn_code, id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Stock item not found', 404);
    return successResponse(res, result.rows[0], 'Stock item updated');
  } catch (err) { next(err); }
};

const deleteStockItem = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    await db.query('UPDATE stock_items SET is_active = false WHERE id = $1 AND company_id = $2', [id, companyId]);
    return successResponse(res, null, 'Stock item deleted');
  } catch (err) { next(err); }
};

module.exports = { getStockItems, getStockItem, createStockItem, updateStockItem, deleteStockItem };