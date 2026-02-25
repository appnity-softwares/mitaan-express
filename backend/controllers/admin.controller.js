const prisma = require('../prisma');

exports.getStats = async (req, res) => {
    try {
        const totalArticles = await prisma.article.count();
        const publishedArticles = await prisma.article.count({ where: { status: 'PUBLISHED' } });
        const draftArticles = await prisma.article.count({ where: { status: 'DRAFT' } });

        // Today's news
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayArticles = await prisma.article.count({ where: { createdAt: { gte: today } } });

        const trendingCount = await prisma.article.count({ where: { isTrending: true } });
        const breakingCount = await prisma.article.count({ where: { isBreaking: true } });

        const categoryStats = await prisma.article.groupBy({
            by: ['categoryId'],
            _count: { categoryId: true },
        });

        // Fetch category names for mapping
        const categories = await prisma.category.findMany({ select: { id: true, name: true } });

        const categoryCounts = categories.map(cat => {
            const stat = categoryStats.find(s => s.categoryId === cat.id);
            return {
                name: cat.name,
                count: stat ? stat._count.categoryId : 0
            };
        }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        // Limit to top categories for dashboard to prevent huge response
        const topCategories = categoryCounts.slice(0, 10);

        const totalViews = await prisma.article.aggregate({
            _sum: { views: true }
        });

        res.json({
            totalArticles,
            publishedArticles,
            draftArticles,
            todayArticles,
            trendingCount,
            breakingCount,
            categoryCounts,
            totalViews: totalViews._sum.views || 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
