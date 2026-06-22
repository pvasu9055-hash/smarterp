const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getUnits, createUnit, deleteUnit } = require('../controllers/unit.controller');

router.use(verifyToken);
router.get('/:companyId', getUnits);
router.post('/:companyId', createUnit);
router.delete('/:companyId/:id', deleteUnit);

module.exports = router;