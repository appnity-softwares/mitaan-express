const fs = require('fs');
const path = require('path');
const prisma = require('../prisma');
const { stripHtml } = require('../utils/sanitize');

/**
 * PHASE 3 & FIX 3: HARDEN IMAGE FALLBACK
 */
function getImageUrl(image) {
    const R2_BASE = "https://pub-c3d6bb19e99a4f0dae3b620370bc1b9f.r2.dev/";
    const DEFAULT = "https://mitaanexpress.com/uploads/defaultog.png";

    // FIX 3: Empty string "" or missing handled correctly
    if (!image || (typeof image === 'string' && image.trim() === "")) return DEFAULT;
    
    if (image.startsWith("http")) return image;
    if (image.startsWith("data:")) return DEFAULT;

    // Clean relative path
    const cleanPath = image.startsWith('/') ? image.slice(1) : image;
    return R2_BASE + cleanPath;
}

/**
 * SEO Meta Tag Generator
 */
const generateMetaTags = (data) => {
    const { 
        title, 
        description, 
        imageUrl, 
        pageUrl, 
        siteName, 
        isoDate, 
        modifiedDate, 
        isArticleType, 
        categoryName,
        jsonLd 
    } = data;

    let tags = `
    <title>${title} - ${siteName}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="${isArticleType ? 'article' : 'website'}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    `;

    if (isArticleType) {
        tags += `    <meta property="article:published_time" content="${isoDate}" />\n`;
        tags += `    <meta property="article:modified_time" content="${modifiedDate}" />\n`;
        tags += `    <meta property="article:section" content="${categoryName}" />\n`;
    }

    return tags;
};

/**
 * SEO Renderer Middleware - FINAL REFINED VERSION
 */
const seoRenderer = async (req, res, next) => {
    // CRITICAL DIAGNOSTIC: Confirm middleware is actually execution
    console.log("SEO MIDDLEWARE HIT:", req.path);

    const reqPath = req.path;
    const isArticle = reqPath.startsWith('/article/');
    const isInsight = reqPath.startsWith('/insight/');
    const isBlog = reqPath.startsWith('/blog/');
    const isCategory = reqPath.startsWith('/category/');
    const isAuthor = reqPath.startsWith('/author/');
    const isPublisher = reqPath.startsWith('/publisher/');
    const isVideo = reqPath.startsWith('/v/') || reqPath.startsWith('/video/');
    const isGallery = reqPath.startsWith('/gallery/');
    const isPoetry = reqPath.startsWith('/p/');
    const isHome = reqPath === '/';

    const DOMAIN = process.env.FRONTEND_URL || 'https://mitaanexpress.com';
    const siteName = 'Mitaan Express';
    let data = null;

    try {
        const pathParts = reqPath.split('/').filter(Boolean);
        const identifier = pathParts[1] || '';
        let decodedId = identifier;
        try { decodedId = decodeURIComponent(identifier).trim(); } catch (e) {}
        const isNumeric = /^\d+$/.test(decodedId);

        // DATA FETCH LOGIC
        const artCount = await prisma.article.count();
        const blogCount = await prisma.blog.count();
        const dbHint = (process.env.DATABASE_URL || '').split('@')[1] || 'unknown';
        
        console.log(`[SEO DEBUG] DB STATS: Articles: ${artCount}, Blogs: ${blogCount}, DB: ${dbHint}`);
        console.log(`[SEO DEBUG] Checking identifier: "${decodedId}" (Numeric: ${isNumeric})`);
        
        if (isArticle || isInsight || isBlog) {
            console.log(`[SEO DEBUG] Searching for Story: ${decodedId}`);
            
            // Try ARTICLE table first
            data = await prisma.article.findFirst({
                where: {
                    OR: [
                        { slug: decodedId },
                        // Find if DB slug is a truncated version of the URL slug
                        { slug: { in: [decodedId.substring(0, 100), decodedId.substring(0, 110), decodedId.substring(0, 120)] } },
                        // Find if URL slug starts with what's in the DB (for very long IDs)
                        { slug: { startsWith: decodedId.substring(0, 50) } },
                        { id: isNumeric ? parseInt(decodedId) : -999 }
                    ]
                },
                select: {
                    title: true, shortDescription: true, image: true,
                    publishedAt: true, updatedAt: true, createdAt: true,
                    category: { select: { name: true, nameHi: true } }
                }
            });

            // FALLBACK TO BLOG table if not found in Article
            if (!data) {
                console.log(`[SEO DEBUG] Not found in Article, checking BLOG table...`);
                data = await prisma.blog.findFirst({
                    where: {
                        OR: [
                            { slug: decodedId },
                            { slug: { in: [decodedId.substring(0, 100), decodedId.substring(0, 110), decodedId.substring(0, 120)] } },
                            { slug: { startsWith: decodedId.substring(0, 50) } },
                            { id: isNumeric ? parseInt(decodedId) : -999 }
                        ]
                    },
                    select: {
                        title: true, shortDescription: true, image: true,
                        updatedAt: true, createdAt: true
                    }
                });
            }
            console.log(`[SEO DEBUG] Story Result: ${data ? 'SUCCESS' : 'NOT FOUND'}`);
        } else if (isCategory) {
            data = await prisma.category.findFirst({
                where: { OR: [ { slug: decodedId }, { id: isNumeric ? parseInt(decodedId) : -999 } ] },
                select: { name: true, nameHi: true, description: true, image: true }
            });
            if (data) {
                data.title = (data.nameHi || data.name) + ' - Mitaan Express';
                data.shortDescription = data.description;
            }
        } else if (isAuthor || isPublisher) {
            // Check User table for authors
            const user = await prisma.user.findFirst({
                where: { OR: [ { name: decodedId }, { id: isNumeric ? parseInt(decodedId) : -999 } ] },
                select: { name: true, bio: true, image: true }
            });
            // Also check Publisher table
            const publisher = !user ? await prisma.publisher.findFirst({
                where: { OR: [ { slug: decodedId }, { id: isNumeric ? parseInt(decodedId) : -999 } ] },
                select: { name: true, nameHi: true, description: true, image: true }
            }) : null;

            if (user || publisher) {
                const target = user || publisher;
                data = {
                    title: (target.nameHi || target.name) + ' - Profile',
                    shortDescription: target.bio || target.description || 'Contributor at Mitaan Express',
                    image: target.image
                };
            }
        } else if (isVideo || isGallery) {
            data = await prisma.media.findFirst({
                where: { id: isNumeric ? parseInt(decodedId) : -999 },
                select: { title: true, description: true, thumbnail: true, url: true }
            });
            if (data) {
                data.shortDescription = data.description;
                data.image = data.thumbnail || data.url;
            }
        } else if (isHome) {
            const settingsList = await prisma.setting.findMany({
                where: { key: { in: ['site_title', 'site_description', 'logo_url'] } }
            });
            const settings = settingsList.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
            data = {
                title: settings.site_title || siteName,
                shortDescription: settings.site_description || 'Unbiased news and premium insights.',
                image: settings.logo_url || '/logo.png',
                isHome: true
            };
        }
    } catch (err) {
        console.error("[SEO DB ERROR]", err);
    }

    // FALLBACK SYSTEM
    if (!data) {
        data = {
            title: siteName + ' - Latest News',
            shortDescription: 'Unbiased news, investigative insights, and real-time updates from Mitaan Express.',
            image: null,
            createdAt: new Date()
        };
    }

    // FIX 1 & 5: CORRECT OG TYPE LOGIC
    // SPEC: /article -> og:type = article | /insight & /blog -> og:type = website
    const isArticleType = isArticle; 

    // FIX 2: CORRECT JSON-LD TYPE
    const jsonLdType = isArticle 
        ? "NewsArticle" 
        : (isBlog || isInsight ? "BlogPosting" : "WebSite");

    // FIX 4: ENSURE CLEAN OG IMAGE OUTPUT
    const imageUrl = getImageUrl(data.image);

    // FIX 6: LOGGING
    console.log("-----------------------------------------");
    console.log("ROUTE:", reqPath);
    console.log("IS ARTICLE:", isArticle);
    console.log("IS INSIGHT:", isInsight);
    console.log("DATA FOUND:", !!data && !data.isHome);
    console.log("FINAL IMAGE:", imageUrl);
    console.log("-----------------------------------------");

    // SANITIZATION
    const cleanTitle = stripHtml(data.title || siteName).replace(/"/g, '&quot;');
    const cleanDesc = stripHtml(data.shortDescription || '').replace(/"/g, '&quot;').substring(0, 160);

    const isoDate = new Date(data.publishedAt || data.createdAt || new Date()).toISOString();
    const modifiedDate = new Date(data.updatedAt || data.createdAt || new Date()).toISOString();
    
    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": isCategory ? "WebPage" : jsonLdType,
        "headline": cleanTitle,
        "description": cleanDesc,
        "image": [imageUrl],
        "datePublished": isoDate,
        "dateModified": modifiedDate,
        "publisher": { 
            "@type": "Organization", 
            "name": siteName, 
            "logo": { "@type": "ImageObject", "url": `${DOMAIN}/logo.png` } 
        }
    };

    // GENERATE TAGS
    const metaTags = generateMetaTags({
        title: cleanTitle,
        description: cleanDesc,
        imageUrl,
        pageUrl: `${DOMAIN}${reqPath}`,
        siteName,
        isoDate,
        modifiedDate,
        isArticleType, // FIX 1 applied here
        categoryName: data.category?.name || 'News',
        jsonLd
    });

    // LOAD AND INJECT
    const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
    let html = '';
    try {
        html = fs.readFileSync(indexPath, 'utf8');
    } catch (e) {
        html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><head><body><div id="root"></div></body></html>`;
    }

    // SCRUBBING
    html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
    html = html.replace(/<meta[^>]*?property=["']og:[\s\S]*?["'][^>]*?>/gi, '');
    html = html.replace(/<meta[^>]*?name=["']twitter:[\s\S]*?["'][^>]*?>/gi, '');
    html = html.replace(/<meta[^>]*?name=["']description["'][^>]*?>/gi, '');
    html = html.replace(/<link[^>]*?rel=["']canonical["'][^>]*?>/gi, '');

    // INJECTION
    html = html.replace('<head>', `<head>\n${metaTags}\n`);

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.header('Content-Type', 'text/html');
    return res.send(html);
};

module.exports = seoRenderer;
