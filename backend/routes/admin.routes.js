const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/stats', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), adminController.getStats);

// User management routes (Admin only)
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), userController.getAllUsers);
router.put('/users/:id/role', authenticateToken, authorizeRoles('ADMIN'), userController.updateUserRole);
router.delete('/users/:id', authenticateToken, authorizeRoles('ADMIN'), userController.deleteUser);

module.exports = router;
