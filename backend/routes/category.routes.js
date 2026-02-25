const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/', categoryController.getAllCategories);

// Protected routes
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), categoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), categoryController.deleteCategory);

module.exports = router;
