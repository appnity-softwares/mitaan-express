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
        let { title, content, status, language, tags, categoryId, image, shortDescription } = req.body;

        // Handle Featured Image Upload to R2
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        // Process Content Images
        if (isR2Enabled && content) {
            content = await processContentImages(content);
        }

        // Improved slug generation: support Hindi and avoid empty/invalid slugs
        let slug = req.body.slug;
        if (!slug || slug.trim() === '') {
            slug = title.toLowerCase()
                .replace(/[^a-z0-9\u0900-\u097F]+/g, '-') // Support Hindi characters
                .replace(/^-+|-+$/g, '');
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
                author: { connect: { id: req.user.id } },
                category: categoryId ? { connect: { id: parseInt(categoryId) } } : undefined,
                tags: tags && tags.length > 0 ? {
                    connectOrCreate: tags.map(tag => {
                        const tagSlug = tag.toLowerCase()
                            .replace(/[^a-z0-9\u0900-\u097F]+/g, '-')
                            .replace(/^-+|-+$/g, '');
                        return {
                            where: { name: tag },
                            create: {
                                name: tag,
                                slug: tagSlug || 'tag-' + Math.random().toString(36).substring(2, 7)
                            }
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
        let { title, content, status, language, tags, categoryId, image, shortDescription } = req.body;

        // Handle Featured Image Upload to R2
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        // Process Content Images
        if (isR2Enabled && content) {
            content = await processContentImages(content);
        }

        const blog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: {
                title,
                content,
                status,
                language,
                image,
                shortDescription,
                category: categoryId ? { connect: { id: parseInt(categoryId) } } : { disconnect: true },
                tags: tags ? {
                    set: [], // Clear existing relations
                    connectOrCreate: tags.map(tag => ({
                        where: { name: tag },
                        create: { name: tag, slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
                    }))
                } : undefined
            }
        });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog' });
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
