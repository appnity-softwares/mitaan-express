const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

router.post('/', authenticateToken, blogController.createBlog);
router.put('/:id', authenticateToken, blogController.updateBlog);
router.delete('/:id', authenticateToken, blogController.deleteBlog);

module.exports = router;
