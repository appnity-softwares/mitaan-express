const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Dynamically generate sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
    try {
        const DOMAIN = process.env.FRONTEND_URL || 'https://mitaanexpress.com';
        
        // Fetch published articles
        const articles = await prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true, id: true, updatedAt: true }
        });

        // Fetch published blogs
        const blogs = await prisma.blog.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true, id: true, updatedAt: true }
        });

        // Fetch categories
        const categories = await prisma.category.findMany({
            select: { slug: true, id: true }
        });

        const staticPages = [
            '',
            '/about',
            '/contact',
            '/gallery',
            '/video',
            '/poetry',
            '/insights',
            '/trending',
            '/terms',
            '/privacy'
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Static Pages
        staticPages.forEach(page => {
            xml += `
  <url>
    <loc>${DOMAIN}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
        });

        // Categories
        categories.forEach(cat => {
            xml += `
  <url>
    <loc>${DOMAIN}/category/${cat.slug || cat.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Articles
        articles.forEach(art => {
            xml += `
  <url>
    <loc>${DOMAIN}/article/${art.slug || art.id}</loc>
    <lastmod>${art.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        // Blogs
        blogs.forEach(blog => {
            xml += `
  <url>
    <loc>${DOMAIN}/insight/${blog.slug || blog.id}</loc>
    <lastmod>${blog.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        xml += `\n</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// RSS Feed for Google News
router.get('/rss.xml', async (req, res) => {
    try {
        const DOMAIN = process.env.FRONTEND_URL || 'https://mitaanexpress.com';
        
        const articles = await prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { category: true, author: true }
        });

        let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Mitaan Express - Latest News</title>
  <link>${DOMAIN}</link>
  <description>Unbiased news, deep insights, and real-time updates from Mitaan Express.</description>
  <language>hi-IN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

        articles.forEach(art => {
            const url = `${DOMAIN}/article/${art.slug || art.id}`;
            rss += `
  <item>
    <title><![CDATA[${art.title}]]></title>
    <link>${url}</link>
    <guid isPermaLink="false">${art.id}</guid>
    <pubDate>${new Date(art.createdAt).toUTCString()}</pubDate>
    <dc:creator><![CDATA[${art.authorName || art.author?.name || 'Mitaan Team'}]]></dc:creator>
    <description><![CDATA[${art.shortDescription || ''}]]></description>
    <category><![CDATA[${art.category?.name || 'News'}]]></category>
    ${art.image ? `<media:content url="${art.image}" medium="image" />` : ''}
  </item>`;
        });

        rss += `\n</channel>\n</rss>`;

        res.header('Content-Type', 'application/rss+xml');
        res.send(rss);
    } catch (error) {
        console.error('RSS generation error:', error);
        res.status(500).send('Error generating RSS feed');
    }
});

// Serve robots.txt
router.get('/robots.txt', (req, res) => {
    const DOMAIN = process.env.FRONTEND_URL || 'https://mitaanexpress.com';
    const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login
Disallow: /signup

Sitemap: ${DOMAIN}/api/seo/sitemap.xml
Sitemap: ${DOMAIN}/api/seo/rss.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

module.exports = router;
