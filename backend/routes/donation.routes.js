const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Public route to create a donation
router.post('/', donationController.createDonation);

// Private route for admin to see donations
router.get('/', authenticateToken, authorizeRoles('ADMIN'), donationController.getAllDonations);

module.exports = router;
