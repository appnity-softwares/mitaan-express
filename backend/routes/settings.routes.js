const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/', getSettings); // Public read? Or protected? Admin panel needs read. Frontend might need read too. Let's make public read for now or separate public endpoint.
// For admin panel usage, authentication is fine.
// But frontend needs these settings too. 
// I'll make GET public for now (or at least accessible). 
// Actually, usually settings like Logo/Title are public.


router.post('/', authenticateToken, authorizeRoles('ADMIN'), updateSettings);

module.exports = router;
