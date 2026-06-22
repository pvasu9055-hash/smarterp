const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getLedgers, createLedger, updateLedger, deleteLedger, getLedger } = require('../controllers/ledger.controller');

router.use(verifyToken);
router.get('/:companyId', getLedgers);
router.get('/:companyId/:id', getLedger);
router.post('/:companyId', createLedger);
router.put('/:companyId/:id', updateLedger);
router.delete('/:companyId/:id', deleteLedger);

module.exports = router;