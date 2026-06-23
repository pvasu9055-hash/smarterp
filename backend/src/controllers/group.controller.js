const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getGroups = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const result = await db.query(
      `SELECT g.*, p.name as parent_name FROM groups g LEFT JOIN groups p ON g.parent_id = p.id WHERE g.company_id = $1 ORDER BY g.name`,
      [companyId]
    );
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const createGroup = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { name, nature, parent_group_id } = req.body;
    if (!name) return errorResponse(res, 'Name is required');
    const result = await db.query(
      'INSERT INTO groups (company_id, name, type, parent_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [companyId, name, nature || 'assets', parent_group_id || null]
    );
    return successResponse(res, result.rows[0], 'Group created', 201);
  } catch (err) { next(err); }
};

const updateGroup = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const { name, nature, parent_group_id } = req.body;
    const result = await db.query(
      `UPDATE groups SET name=$1, type=$2, parent_id=$3 WHERE id=$4 AND company_id=$5 RETURNING *`,
      [name, nature, parent_group_id || null, id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Group not found', 404);
    return successResponse(res, result.rows[0], 'Group updated');
  } catch (err) { next(err); }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const result = await db.query(
      'DELETE FROM groups WHERE id=$1 AND company_id=$2 RETURNING id',
      [id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Group not found', 404);
    return successResponse(res, null, 'Group deleted');
  } catch (err) { next(err); }
};

module.exports = { getGroups, createGroup, updateGroup, deleteGroup };