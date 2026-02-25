const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getTrafficAnalytics,
    getCommentActivity
} = require('../controllers/analytics.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// All analytics routes require admin authentication
router.get('/dashboard', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), getDashboardStats);
router.get('/traffic', authenticateToken, authorizeRoles('ADMIN'), getTrafficAnalytics);


module.exports = router;
