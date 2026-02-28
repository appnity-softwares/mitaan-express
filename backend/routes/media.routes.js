const express = require('express');
const router = express.Router();
const {
    getPublicMedia,
    getAdminMedia,
    createMedia,
    updateMedia,
    deleteMedia,
    incrementViews
} = require('../controllers/media.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');

// Public routes
router.get('/', getPublicMedia);
router.post('/:id/view', incrementViews);

// Admin routes
router.get('/admin', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), getAdminMedia);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), upload.single('file'), createMedia);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), updateMedia);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteMedia);

module.exports = router;
