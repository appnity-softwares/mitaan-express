const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisher.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Public route to get all publishers (e.g. for dropdowns)
router.get('/', publisherController.getAllPublishers);
router.get('/:id', publisherController.getPublisherById);

// Protected CRUD routes
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), publisherController.createPublisher);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), publisherController.updatePublisher);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), publisherController.deletePublisher);

module.exports = router;
