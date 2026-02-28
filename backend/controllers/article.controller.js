const prisma = require('../prisma');

exports.getAllArticles = async (req, res) => {
    try {
        const { category, tag, status, search, limit, author, lang } = req.query;

        const where = {};
        if (category) where.category = { slug: category };
        if (tag) where.tags = { some: { slug: tag } };
        if (status) where.status = status;
        if (author) where.authorId = parseInt(author);
        if (lang) where.language = lang; // Filter by language (en/hi)
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        const articles = await prisma.article.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                shortDescription: true,
                image: true,
                videoUrl: true,
                views: true,
                status: true,
                published: true,
                language: true,
                isFeatured: true,
                isTrending: true,
                isBreaking: true,
                categoryId: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        nameHi: true,
                        slug: true,
                        parentId: true,
                        parent: {
                            select: { id: true, name: true, nameHi: true, slug: true }
                        }
                    }
                },
                author: {
                    select: { id: true, name: true, image: true }
                },
                tags: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined
        });
        res.json(articles);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch articles', details: error.message, stack: error.stack });
    }
};

exports.getArticleBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        let article;

        // Check if slug is a numeric ID
        const isNumeric = /^\d+$/.test(slug);

        if (isNumeric) {
            // Fetch by ID
            article = await prisma.article.findUnique({
                where: { id: parseInt(slug) },
                include: {
                    category: {
                        include: { parent: true }
                    },
                    author: { select: { name: true, image: true, bio: true } },
                    tags: true,
                },
            });
        } else {
            // Fetch by slug
            article = await prisma.article.findUnique({
                where: { slug },
                include: {
                    category: {
                        include: { parent: true }
                    },
                    author: { select: { name: true, image: true, bio: true } },
                    tags: true,
                },
            });
        }

        if (!article) return res.status(404).json({ error: 'Article not found' });

        // Increment views only for frontend (not admin)
        if (!req.headers.authorization) {
            await prisma.article.update({
                where: { id: article.id },
                data: { views: { increment: 1 } }
            });
        }

        res.json(article);
    } catch (error) {
        console.error('Fetch article error:', error);
        res.status(500).json({ error: 'Failed to fetch article', details: error.message, prismaError: error.code });
    }
};

const { uploadToR2, processContentImages, isR2Enabled } = require('../utils/r2');

exports.createArticle = async (req, res) => {
    let {
        title, slug, content, shortDescription, image, videoUrl, categoryId,
        tags, isBreaking, isTrending, isFeatured,
        metaTitle, metaDescription, metaKeywords, status, metadata,
        priority, scheduledAt, language
    } = req.body;

    if (!categoryId || isNaN(parseInt(categoryId))) {
        return res.status(400).json({ error: 'Please select a valid category.' });
    }

    try {
        // Handle Featured Image Upload to R2
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `article-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        // Process Content Images
        if (isR2Enabled && content) {
            content = await processContentImages(content);
        }

        // Improved slug generation
        let finalSlug = slug;
        if (!finalSlug || finalSlug.trim() === '') {
            finalSlug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        if (!finalSlug || finalSlug === '-') finalSlug = 'article-' + Math.random().toString(36).substring(2, 7);

        // Simple duplicate check
        const exists = await prisma.article.findUnique({ where: { slug: finalSlug } });
        if (exists) finalSlug = `${finalSlug}-${Date.now()}`;

        // Handle tags: array of strings => create or connect
        let tagConnect = [];
        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                let tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                if (!tagSlug || tagSlug === '-') tagSlug = 'tag-' + Math.random().toString(36).substring(2, 7);
                tagConnect.push({
                    where: { slug: tagSlug },
                    create: { name: tagName, slug: tagSlug }
                });
            }
        }

        // Validate user authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User authentication failed. Please login again.' });
        }

        console.log('Creating article with data:', { title, slug: finalSlug, categoryId, userId: req.user.id });
        const article = await prisma.article.create({
            data: {
                title, slug: finalSlug, content, shortDescription, image, videoUrl,
                isBreaking: isBreaking || false,
                isTrending: isTrending || false,
                isFeatured: isFeatured || false,
                language: language || 'en',
                metaTitle, metaDescription, metaKeywords,
                metadata: metadata || {},
                status: status || 'DRAFT',
                published: status === 'PUBLISHED',
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                priority: priority || 'NORMAL',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                category: { connect: { id: parseInt(categoryId) } },
                author: { connect: { id: req.user.id } },
                tags: { connectOrCreate: tagConnect }
            },
        });
        res.json(article);
    } catch (error) {
        console.error('Create error DETAILS:', error);

        // Return specific error message if it's a unique constraint violation
        if (error.code === 'P2002') {
            return res.status(400).json({
                error: `Failed: An article with slug already exists. Please change the title or URL slug.`
            });
        }

        res.status(500).json({ error: 'Failed to create article: ' + (error.message || 'Unknown error') });
    }
};

exports.updateArticle = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
        return res.status(400).json({ error: 'Invalid article ID provided for update' });
    }

    let {
        title, slug, content, shortDescription, image, videoUrl, categoryId,
        tags, isBreaking, isTrending, isFeatured,
        metaTitle, metaDescription, metaKeywords, status, metadata,
        priority, scheduledAt, language
    } = req.body;

    try {
        // Handle Featured Image Upload to R2
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `article-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        // Process Content Images
        if (isR2Enabled && content) {
            content = await processContentImages(content);
        }

        const updateData = {
            title, slug, content, shortDescription, image, videoUrl,
            isBreaking, isTrending, isFeatured,
            language: language || 'en',
            metaTitle, metaDescription, metaKeywords,
            metadata: metadata || undefined,
            status,
            published: status === 'PUBLISHED',
            priority: priority || undefined,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
        };

        if (categoryId) updateData.category = { connect: { id: parseInt(categoryId) } };

        const article = await prisma.article.update({
            where: { id: articleId },
            data: updateData
        });
        res.json(article);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
};

exports.deleteArticle = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
        return res.status(400).json({ error: 'Invalid article ID provided for delete' });
    }

    try {
        await prisma.article.delete({ where: { id: articleId } });
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
};

// Toggle article active/inactive status
exports.toggleActive = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.findUnique({
            where: { id: parseInt(id) },
            select: { published: true }
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const updated = await prisma.article.update({
            where: { id: parseInt(id) },
            data: { published: !article.published }
        });

        res.json({
            message: `Article ${updated.published ? 'activated' : 'deactivated'}`,
            published: updated.published
        });
    } catch (error) {
        console.error('Toggle error:', error);
        res.status(500).json({ error: 'Toggle failed' });
    }
};
