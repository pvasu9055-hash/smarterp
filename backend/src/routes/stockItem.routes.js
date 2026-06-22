const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getStockItems, createStockItem, updateStockItem, deleteStockItem, getStockItem } = require('../controllers/stockItem.controller');

router.use(verifyToken);
router.get('/:companyId', getStockItems);
router.get('/:companyId/:id', getStockItem);
router.post('/:companyId', createStockItem);
router.put('/:companyId/:id', updateStockItem);
router.delete('/:companyId/:id', deleteStockItem);

module.exports = router;