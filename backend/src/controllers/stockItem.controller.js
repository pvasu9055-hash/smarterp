const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getStockItems = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { search, low_stock } = req.query;
    let query = `SELECT s.*, sg.name as stock_group_name, u.symbol as unit_symbol 
                 FROM stock_items s 
                 LEFT JOIN stock_groups sg ON s.stock_group_id = sg.id 
                 LEFT JOIN units u ON s.unit_id = u.id 
                 WHERE s.company_id = $1 AND s.is_active = true`;
    const params = [companyId];
    if (search) { query += ` AND s.name ILIKE $${params.length + 1}`; params.push(`%${search}%`); }
    if (low_stock === 'true') { query += ` AND s.current_quantity <= s.minimum_quantity`; }
    query += ` ORDER BY s.name`;
    const result = await db.query(query, params);
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const getStockItem = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const result = await db.query(
      `SELECT s.*, sg.name as stock_group_name, u.symbol as unit_symbol 
       FROM stock_items s 
       LEFT JOIN stock_groups sg ON s.stock_group_id = sg.id 
       LEFT JOIN units u ON s.unit_id = u.id 
       WHERE s.id = $1 AND s.company_id = $2`,
      [id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Stock item not found', 404);
    return successResponse(res, result.rows[0]);
  } catch (err) { next(err); }
};

const createStockItem = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const {
      stock_group_id, unit_id, name, sku, description,
      purchase_price, selling_price, mrp, gst_percentage,
      hsn_code, opening_quantity, minimum_quantity
    } = req.body;
    if (!name) return errorResponse(res, 'Item name is required');

    const result = await db.query(
      `INSERT INTO stock_items (company_id, stock_group_id, unit_id, name, sku, description, purchase_price, selling_price, mrp, gst_percentage, hsn_code, opening_quantity, current_quantity, minimum_quantity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$13) RETURNING *`,
      [companyId, stock_group_id, unit_id, name, sku, description,
       purchase_price || 0, selling_price || 0, mrp,
       gst_percentage || 0, hsn_code, opening_quantity || 0, minimum_quantity || 0]
    );
    return successResponse(res, result.rows[0], 'Stock item created', 201);
  } catch (err) { next(err); }
};

const updateStockItem = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const {
      stock_group_id, unit_id, name, sku, description,
      purchase_price, selling_price, mrp, gst_percentage,
      hsn_code, minimum_quantity
    } = req.body;
    const result = await db.query(
      `UPDATE stock_items SET stock_group_id=$1, unit_id=$2, name=$3, sku=$4, description=$5, 
       purchase_price=$6, selling_price=$7, mrp=$8, gst_percentage=$9, hsn_code=$10, minimum_quantity=$11
       WHERE id=$12 AND company_id=$13 RETURNING *`,
      [stock_group_id, unit_id, name, sku, description,
       purchase_price, selling_price, mrp, gst_percentage,
       hsn_code, minimum_quantity, id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Stock item not found', 404);
    return successResponse(res, result.rows[0], 'Stock item updated');
  } catch (err) { next(err); }
};

const deleteStockItem = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    await db.query(
      'UPDATE stock_items SET is_active = false WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    return successResponse(res, null, 'Stock item deleted');
  } catch (err) { next(err); }
};

module.exports = { getStockItems, getStockItem, createStockItem, updateStockItem, deleteStockItem };