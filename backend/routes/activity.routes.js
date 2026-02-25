const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, authorizeRoles('ADMIN'), activityController.getLogs);

module.exports = router;
