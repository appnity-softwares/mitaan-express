const prisma = require('../prisma');
const { sanitizeFields, PLAIN_TEXT_FIELDS } = require('../utils/sanitize');

exports.getAllBlogs = async (req, res) => {
    try {
        const { lang, search, author, page = 1, limit = 10, status } = req.query;
        
        // Input validation
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (isNaN(pageNum) || pageNum < 1 || pageNum > 10000) {
            return res.status(400).json({ error: 'Page must be between 1 and 10000' });
        }
        
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({ error: 'Limit must be between 1 and 100' });
        }
        
        const skip = (pageNum - 1) * limitNum;
        const take = limitNum;
        const where = {};

        if (lang && typeof lang === 'string' && lang.length <= 10) {
            where.language = lang;
        }
        
        if (author && !isNaN(parseInt(author))) {
            const authorId = parseInt(author);
            if (authorId > 0 && authorId <= 2147483647) {
                where.authorId = authorId;
            }
        }
        
        if (status && ['DRAFT', 'PUBLISHED'].includes(status)) {
            where.status = status;
        }
        
        if (search && typeof search === 'string') {
            if (search.length > 500) {
                return res.status(400).json({ error: 'Search query too long (max 500 characters)' });
            }
            where.OR = [
                { title: { contains: search.substring(0, 500), mode: 'insensitive' } },
                { content: { contains: search.substring(0, 500), mode: 'insensitive' } }
            ];
        }

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                select: {
                    id: true, title: true, slug: true, content: true, shortDescription: true,
                    image: true, authorName: true, authorImage: true, status: true,
                    language: true, views: true, isBreaking: true, isTrending: true,
                    isFeatured: true, isMustRead: true, categoryId: true, createdAt: true,
                    updatedAt: true,
                    publisherId: true,
                    publisher: {
                        select: { id: true, name: true, nameHi: true, image: true, designation: true }
                    },
                    category: { select: { id: true, name: true, nameHi: true, slug: true } },
                    author: { select: { id: true, name: true, image: true } },
                    tags: { select: { id: true, name: true, slug: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.blog.count({ where })
        ]);

        res.json({
            blogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        console.error('Fetch Blogs Error:', error);
        res.status(500).json({ error: 'Failed to fetch blogs', details: error.message });
    }
};

exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Input validation
        if (!slug || typeof slug !== 'string') {
            return res.status(400).json({ error: 'Slug is required and must be a string' });
        }
        
        if (slug.length > 255) {
            return res.status(400).json({ error: 'Slug too long (max 255 characters)' });
        }
        
        const blog = await prisma.blog.findUnique({
            where: { slug: slug.substring(0, 255) },
            select: {
                id: true, title: true, slug: true, content: true, shortDescription: true,
                image: true, authorName: true, authorImage: true, status: true,
                language: true, views: true, isBreaking: true, isTrending: true,
                isFeatured: true, isMustRead: true, categoryId: true, createdAt: true,
                updatedAt: true,
                publisherId: true,
                publisher: {
                    select: { id: true, name: true, nameHi: true, image: true, description: true, designation: true }
                },
                category: { select: { id: true, name: true, nameHi: true, slug: true } },
                author: { select: { id: true, name: true, image: true } },
                tags: { select: { id: true, name: true, slug: true } }
            }
        });
        
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        console.error('Get blog error:', error);
        
        if (error.name === 'PrismaClientKnownRequestError') {
            return res.status(400).json({ 
                error: 'Invalid blog identifier',
                code: error.code 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch blog',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const { uploadToR2, processContentImages, isR2Enabled } = require('../utils/r2');

exports.createBlog = async (req, res) => {
    try {
        let { title, content, status, language, tags, categoryId, image, shortDescription, isBreaking, isTrending, isFeatured, isMustRead, createdAt, authorName, authorImage, publisherId } = req.body;

        // Sanitize plain-text fields - strip HTML tags
        const plainFields = { title, shortDescription, authorName };
        sanitizeFields(plainFields, PLAIN_TEXT_FIELDS);
        title = plainFields.title;
        shortDescription = plainFields.shortDescription;
        authorName = plainFields.authorName;

        // Handle Featured Image Upload to R2
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        // Process Content Images
        if (isR2Enabled && content) {
            content = await processContentImages(content);
        }

        // Slug generation: preserve Hindi/Devanagari characters for pretty URLs
        let slug = req.body.slug;
        if (!slug || slug.trim() === '') {
            slug = title
                .replace(/[^\w\u0900-\u097F\u0980-\u09FF\s-]+/g, '') // Keep Unicode + alphanumeric
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-+|-+$/g, '')
                .toLowerCase();
        }

        if (!slug || slug === '-') slug = 'post-' + Math.random().toString(36).substring(2, 7);

        // Simple duplicate check before create
        const exists = await prisma.blog.findUnique({ where: { slug } });
        if (exists) slug = `${slug}-${Date.now()}`;

        const blog = await prisma.blog.create({
            data: {
                title,
                slug,
                content,
                status: status || 'DRAFT',
                language: language || 'en',
                image,
                shortDescription,
                isBreaking: isBreaking === true || isBreaking === 'true',
                isTrending: isTrending === true || isTrending === 'true',
                isFeatured: isFeatured === true || isFeatured === 'true',
                isMustRead: isMustRead === true || isMustRead === 'true',
                authorName: authorName || null,
                authorImage: authorImage || null,
                createdAt: createdAt ? new Date(createdAt) : undefined,
                author: { connect: { id: req.user.id } },
                publisher: publisherId ? { connect: { id: parseInt(publisherId) } } : undefined,
                category: categoryId ? { connect: { id: parseInt(categoryId) } } : undefined,
                tags: tags && tags.length > 0 ? {
                    connectOrCreate: tags.map(tag => {
                        let tagSlug = tag.toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\u0900-\u097F\u0980-\u09FF-]+/g, '')
                            .replace(/^-+|-+$/g, '');
                        if (!tagSlug || tagSlug === '-') {
                            tagSlug = 'tag-' + Math.random().toString(36).substring(2, 7);
                        }
                        return {
                            where: { name: tag },
                            create: { name: tag, slug: tagSlug }
                        };
                    })
                } : undefined
            }
        });
        res.json(blog);
    } catch (error) {
        console.error("Create Blog Error:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "A blog or tag with this name/slug already exists." });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        let { title, slug, content, status, language, tags, categoryId, image, shortDescription, isBreaking, isTrending, isFeatured, isMustRead, createdAt, authorName, authorImage, publisherId } = req.body;

        // Sanitize plain-text fields - strip HTML tags
        const plainFields = { title, shortDescription, authorName };
        sanitizeFields(plainFields, PLAIN_TEXT_FIELDS);
        title = plainFields.title;
        shortDescription = plainFields.shortDescription;
        authorName = plainFields.authorName;

        // Handle Featured Image Upload to R2
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        // Process Content Images
        if (isR2Enabled && content) {
            content = await processContentImages(content);
        }

        // Robust slug handling for updates
        let finalSlug = slug;
        if (!finalSlug || finalSlug.trim() === '') {
            finalSlug = title
                .replace(/[^\w\u0900-\u097F\u0980-\u09FF\s-]+/g, '') // Keep Unicode + alphanumeric
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-+|-+$/g, '')
                .toLowerCase();
        }
        if (!finalSlug || finalSlug === '-') finalSlug = 'post-' + Math.random().toString(36).substring(2, 7);

        // Check for duplicate slug (excluding the current blog)
        const duplicate = await prisma.blog.findFirst({
            where: {
                slug: finalSlug,
                NOT: { id: parseInt(id) }
            }
        });
        if (duplicate) finalSlug = `${finalSlug}-${Date.now()}`;

        // Build category update safely
        let categoryUpdate;
        if (categoryId) {
            categoryUpdate = { connect: { id: parseInt(categoryId) } };
        } else {
            // Only disconnect if the blog currently has a category
            const currentBlog = await prisma.blog.findUnique({ where: { id: parseInt(id) }, select: { categoryId: true } });
            categoryUpdate = currentBlog?.categoryId ? { disconnect: true } : undefined;
        }

        const blog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: {
                title,
                slug: finalSlug,
                content,
                status,
                language,
                image,
                shortDescription,
                isBreaking: isBreaking !== undefined ? (isBreaking === true || isBreaking === 'true') : undefined,
                isTrending: isTrending !== undefined ? (isTrending === true || isTrending === 'true') : undefined,
                isFeatured: isFeatured !== undefined ? (isFeatured === true || isFeatured === 'true') : undefined,
                isMustRead: isMustRead !== undefined ? (isMustRead === true || isMustRead === 'true') : undefined,
                authorName: authorName !== undefined ? authorName : undefined,
                authorImage: authorImage !== undefined ? authorImage : undefined,
                createdAt: createdAt ? new Date(createdAt) : undefined,
                category: categoryUpdate,
                tags: tags ? {
                    set: [], // Clear existing relations
                    connectOrCreate: tags.map(tag => {
                        // Generate slug that supports Unicode (Hindi, etc.)
                        let tagSlug = tag.toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\u0900-\u097F\u0980-\u09FF-]+/g, '') // Keep Unicode + alphanumeric
                            .replace(/^-+|-+$/g, '');

                        if (!tagSlug || tagSlug === '-') {
                            tagSlug = 'tag-' + Math.random().toString(36).substring(2, 7);
                        }

                        return {
                            where: { name: tag },
                            create: { name: tag, slug: tagSlug }
                        };
                    })
                } : undefined,
                publisher: publisherId ? { connect: { id: parseInt(publisherId) } } : (req.body.hasOwnProperty('publisherId') ? { disconnect: true } : undefined)
            }
        });
        res.json(blog);
    } catch (error) {
        console.error('Update Blog Error:', error);
        res.status(500).json({ error: error.message || 'Failed to update blog' });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        await prisma.blog.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
};

exports.incrementViews = async (req, res) => {
    try {
        const { id } = req.params;
        const blogId = parseInt(id);
        
        if (isNaN(blogId)) {
            return res.status(400).json({ error: 'Invalid blog ID' });
        }

        // Logic to prevent duplicate counting (e.g. check Authorization header)
        // If it's an admin, don't increment
        if (req.headers.authorization) {
            return res.status(204).end();
        }

        await prisma.blog.update({
            where: { id: blogId },
            data: { views: { increment: 1 } }
        });

        res.status(204).end();
    } catch (error) {
        console.warn('Silent view increment failure:', error.message);
        res.status(204).end(); // Always return success/no-content to frontend
    }
};
