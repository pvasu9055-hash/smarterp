const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getCompanies, createCompany, updateCompany, deleteCompany, selectCompany
} = require('../controllers/company.controller');

router.use(verifyToken);
router.get('/', getCompanies);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.post('/:id/select', selectCompany);

module.exports = router;