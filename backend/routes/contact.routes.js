const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Public: create contact
router.post('/', contactController.createContact);

// Admin: list contacts
router.get('/', authenticateToken, authorizeRoles('ADMIN'), contactController.listContacts);

// Admin: mark as read
router.put('/:id/read', authenticateToken, authorizeRoles('ADMIN'), contactController.markRead);

// Admin: delete contact
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), contactController.deleteContact);

module.exports = router;
