const prisma = require('../prisma');

exports.globalSearch = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ articles: [], blogs: [], categories: [] });
        }

        const searchTerm = q.trim();
        const take = Math.min(parseInt(limit), 20);

        const [articles, blogs, categories] = await Promise.all([
            prisma.article.findMany({
                where: {
                    status: 'PUBLISHED',
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
                        { content: { contains: searchTerm, mode: 'insensitive' } },
                        { tags: { some: { name: { contains: searchTerm, mode: 'insensitive' } } } }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    shortDescription: true,
                    image: true,
                    createdAt: true,
                    category: { select: { name: true, nameHi: true, slug: true } },
                    author: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
                take
            }),
            prisma.blog.findMany({
                where: {
                    status: 'PUBLISHED',
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
                        { content: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    shortDescription: true,
                    image: true,
                    createdAt: true,
                    category: { select: { name: true, nameHi: true } },
                    author: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
                take
            }),
            prisma.category.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { nameHi: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                select: { id: true, name: true, nameHi: true, slug: true, color: true },
                take: 5
            })
        ]);

        res.json({ articles, blogs, categories });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};
