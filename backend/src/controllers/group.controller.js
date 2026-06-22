const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getGroups = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const result = await db.query(
      `SELECT g.*, p.name as parent_name FROM groups g LEFT JOIN groups p ON g.parent_group_id = p.id WHERE g.company_id = $1 ORDER BY g.nature, g.name`,
      [companyId]
    );
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const createGroup = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { name, nature, parent_group_id } = req.body;
    if (!name || !nature) return errorResponse(res, 'Name and nature are required');
    const result = await db.query(
      'INSERT INTO groups (company_id, name, nature, parent_group_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [companyId, name, nature, parent_group_id || null]
    );
    return successResponse(res, result.rows[0], 'Group created', 201);
  } catch (err) { next(err); }
};

const updateGroup = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const { name, nature, parent_group_id } = req.body;
    const result = await db.query(
      `UPDATE groups SET name=$1, nature=$2, parent_group_id=$3 
       WHERE id=$4 AND company_id=$5 AND is_system=false RETURNING *`,
      [name, nature, parent_group_id || null, id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Group not found or is a system group', 404);
    return successResponse(res, result.rows[0], 'Group updated');
  } catch (err) { next(err); }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const result = await db.query(
      'DELETE FROM groups WHERE id=$1 AND company_id=$2 AND is_system=false RETURNING id',
      [id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Group not found or is a system group', 404);
    return successResponse(res, null, 'Group deleted');
  } catch (err) { next(err); }
};

module.exports = { getGroups, createGroup, updateGroup, deleteGroup };