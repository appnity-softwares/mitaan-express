const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/', articleController.getAllArticles);
router.get('/:slug', articleController.getArticleBySlug);



// Protected Routes
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), articleController.createArticle);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), articleController.updateArticle);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), articleController.deleteArticle);
router.patch('/:id/toggle-active', authenticateToken, authorizeRoles('ADMIN', 'EDITOR'), articleController.toggleActive);

module.exports = router;
