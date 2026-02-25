const prisma = require('../prisma');

exports.getAllBlogs = async (req, res) => {
    try {
        const { lang, search, author } = req.query;
        const where = {};

        if (lang) where.language = lang;
        if (author) where.authorId = parseInt(author);
        if (req.query.status) where.status = req.query.status;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        const blogs = await prisma.blog.findMany({
            where,
            include: {
                category: true,
                author: { select: { id: true, name: true, image: true } },
                tags: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(blogs);
    } catch (error) {
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

exports.createBlog = async (req, res) => {
    try {
        const { title, content, status, language, tags, categoryId, image, shortDescription } = req.body;

        // Ensure slug
        console.log("Create Blog Request. Model available?", !!prisma.blog);
        if (!prisma.blog) {
            throw new Error("Prisma Blog model is not initialized. Please restart the server.");
        }

        let slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        // Simple duplicate check (should be more robust in prod)
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
                    connectOrCreate: tags.map(tag => ({
                        where: { name: tag },
                        create: { name: tag, slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
                    }))
                } : undefined
            }
        });
        res.json(blog);
    } catch (error) {
        console.error("Create Blog Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, status, language, tags, categoryId, image, shortDescription } = req.body;

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
