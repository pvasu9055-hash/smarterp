const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getGroups, createGroup, updateGroup, deleteGroup } = require('../controllers/group.controller');

router.use(verifyToken);
router.get('/:companyId', getGroups);
router.post('/:companyId', createGroup);
router.put('/:companyId/:id', updateGroup);
router.delete('/:companyId/:id', deleteGroup);

module.exports = router;