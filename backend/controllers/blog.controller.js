const prisma = require('../prisma');

exports.getAllBlogs = async (req, res) => {
    try {
        const { lang, search, author, page = 1, limit = 10, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const where = {};

        if (lang) where.language = lang;
        if (author) where.authorId = parseInt(author);
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                include: {
                    category: true,
                    author: { select: { id: true, name: true, image: true } },
                    tags: true
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
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
};

exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await prisma.blog.findUnique({
            where: { slug: req.params.slug },
            include: {
                category: true,
                author: { select: { id: true, name: true, image: true } },
                tags: true
            }
        });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
};

const { uploadToR2, processContentImages, isR2Enabled } = require('../utils/r2');

exports.createBlog = async (req, res) => {
    try {
        let { title, content, status, language, tags, categoryId, image, shortDescription, isBreaking, isTrending, isFeatured, createdAt, authorName } = req.body;

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
                authorName: authorName || null,
                createdAt: createdAt ? new Date(createdAt) : undefined,
                author: { connect: { id: req.user.id } },
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
        let { title, slug, content, status, language, tags, categoryId, image, shortDescription, isBreaking, isTrending, isFeatured, createdAt, authorName } = req.body;

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
                authorName: authorName !== undefined ? authorName : undefined,
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
                } : undefined
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
