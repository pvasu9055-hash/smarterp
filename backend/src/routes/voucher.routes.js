const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getVouchers, getVoucher, createSalesVoucher, createPurchaseVoucher, cancelVoucher
} = require('../controllers/voucher.controller');

router.use(verifyToken);
router.get('/:companyId', getVouchers);
router.get('/:companyId/:id', getVoucher);
router.post('/:companyId/sales', createSalesVoucher);
router.post('/:companyId/purchase', createPurchaseVoucher);
router.put('/:companyId/:id/cancel', cancelVoucher);

module.exports = router;