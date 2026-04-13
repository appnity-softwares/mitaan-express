const prisma = require('../prisma');

exports.getAllArticles = async (req, res) => {
    try {
        const { category, tag, status, search, limit, author, lang } = req.query;

        const where = {};
        if (category) where.category = { slug: category };
        if (tag) where.tags = { some: { slug: tag } };
        if (status) where.status = status;
        if (author && !isNaN(parseInt(author))) {
            where.authorId = parseInt(author);
        }
        if (lang) where.language = lang; 

        // ... rest of search logic ...
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
                authorName: true,
                authorImage: true,
                videoUrl: true,
                views: true,
                status: true,
                published: true,
                language: true,
                isFeatured: true,
                isTrending: true,
                isBreaking: true,
                isMustRead: true,
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
                tags: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined
        });
        res.json(articles);
    } catch (error) {
        console.error('Fetch Articles Error:', error);
        res.status(500).json({ error: 'Failed to fetch articles', details: error.message });
    }
};

exports.getArticleBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        let article;

        // Check if slug is a numeric ID
        const isNumeric = /^\d+$/.test(slug);

        const articleSelect = {
            id: true, title: true, slug: true, content: true, shortDescription: true,
            image: true, authorName: true, authorImage: true, videoUrl: true,
            views: true, status: true, published: true, language: true,
            isFeatured: true, isTrending: true, isBreaking: true, isMustRead: true,
            categoryId: true, createdAt: true, updatedAt: true,
            category: {
                select: {
                    id: true, name: true, nameHi: true, slug: true, parentId: true,
                    parent: { select: { id: true, name: true, nameHi: true, slug: true } }
                }
            },
            author: { select: { id: true, name: true, image: true } },
            tags: { select: { id: true, name: true, slug: true } }
        };

        if (isNumeric) {
            // Fetch by ID
            article = await prisma.article.findUnique({
                where: { id: parseInt(slug) },
                select: articleSelect
            });
        } else {
            // Fetch by slug
            article = await prisma.article.findUnique({
                where: { slug },
                select: articleSelect
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
        tags, isBreaking, isTrending, isFeatured, isMustRead,
        metaTitle, metaDescription, metaKeywords, status, metadata,
        priority, scheduledAt, language, authorName, authorImage, createdAt
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

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required.' });
        }

        console.log('Creating article with data:', { title, slug: finalSlug, categoryId, userId: req.user.id });
        const article = await prisma.article.create({
            data: {
                title, slug: finalSlug, content, shortDescription, image, videoUrl,
                isBreaking: isBreaking === true || isBreaking === 'true',
                isTrending: isTrending === true || isTrending === 'true',
                isFeatured: isFeatured === true || isFeatured === 'true',
                isMustRead: isMustRead === true || isMustRead === 'true',
                language: language || 'en',
                authorName: authorName || null,
                authorImage: authorImage || null,
                metaTitle, metaDescription, metaKeywords,
                metadata: metadata || {},
                status: status || 'DRAFT',
                published: status === 'PUBLISHED',
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                priority: priority || 'NORMAL',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                createdAt: createdAt ? new Date(createdAt) : undefined,
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
                error: `Failed: An article with this slug or title already exists.`
            });
        }

        // Handle case where category or author doesn't exist
        if (error.code === 'P2025') {
            return res.status(400).json({
                error: 'The selected category or author was not found.'
            });
        }

        res.status(500).json({ error: 'Failed to create article: ' + (error.message || 'Server error') });
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
        tags, isBreaking, isTrending, isFeatured, isMustRead,
        metaTitle, metaDescription, metaKeywords, status, metadata,
        priority, scheduledAt, language, authorName, authorImage, createdAt
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

        // Robust slug handling for updates
        let finalSlug = slug;
        if (!finalSlug || finalSlug.trim() === '') {
            finalSlug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        if (!finalSlug || finalSlug === '-') finalSlug = 'article-' + Math.random().toString(36).substring(2, 7);

        // Check for duplicate slug (excluding the current article)
        const duplicate = await prisma.article.findFirst({
            where: {
                slug: finalSlug,
                NOT: { id: articleId }
            }
        });
        if (duplicate) finalSlug = `${finalSlug}-${Date.now()}`;

        // Handle tags: array of strings => set, then create or connect
        let tagData = undefined;
        if (tags && Array.isArray(tags)) {
            const tagConnect = [];
            for (const tagName of tags) {
                let tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                if (!tagSlug || tagSlug === '-') tagSlug = 'tag-' + Math.random().toString(36).substring(2, 7);
                tagConnect.push({
                    where: { slug: tagSlug },
                    create: { name: tagName, slug: tagSlug }
                });
            }
            tagData = {
                set: [], // Clear existing tags
                connectOrCreate: tagConnect
            };
        }

        const updateData = {
            title,
            slug: finalSlug,
            content,
            shortDescription,
            image,
            videoUrl,
            isBreaking: isBreaking !== undefined ? (isBreaking === true || isBreaking === 'true') : undefined,
            isTrending: isTrending !== undefined ? (isTrending === true || isTrending === 'true') : undefined,
            isFeatured: isFeatured !== undefined ? (isFeatured === true || isFeatured === 'true') : undefined,
            isMustRead: isMustRead !== undefined ? (isMustRead === true || isMustRead === 'true') : undefined,
            language: language || 'en',
            authorName: authorName !== undefined ? authorName : undefined,
            authorImage: authorImage !== undefined ? authorImage : undefined,
            metaTitle,
            metaDescription,
            metaKeywords,
            metadata: metadata || undefined,
            status,
            published: status === 'PUBLISHED',
            priority: priority || undefined,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            createdAt: createdAt ? new Date(createdAt) : undefined,
            tags: tagData
        };

        if (categoryId && !isNaN(parseInt(categoryId))) {
            updateData.category = { connect: { id: parseInt(categoryId) } };
        } else if (categoryId) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const article = await prisma.article.update({
            where: { id: articleId },
            data: updateData
        });
        res.json(article);
    } catch (error) {
        console.error('Update error:', error);
        
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'An article with this slug already exists.' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Article not found.' });
        }

        res.status(500).json({ error: 'Update failed: ' + (error.message || 'Server error') });
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
