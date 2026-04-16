const fs = require('fs');
const path = require('path');
const prisma = require('../prisma');
const { stripHtml } = require('../utils/sanitize');

/**
 * Generates SEO meta tags string.
 */
const generateMetaTags = (data) => {
    const { title, description, imageUrl, pageUrl, siteName, isoDate, modifiedDate, imageAlt, jsonLd, isCategory, categoryName, videoUrl } = data;

    let tags = `
    <title>${title} - ${siteName}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="675" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="${isCategory ? 'website' : 'article'}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:updated_time" content="${modifiedDate}" />
    <meta property="og:locale" content="hi_IN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
    <meta name="twitter:site" content="@mitaanexpress" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    `;

    if (!isCategory) {
        tags += `    <meta property="article:published_time" content="${isoDate}" />\n`;
        tags += `    <meta property="article:modified_time" content="${modifiedDate}" />\n`;
        tags += `    <meta property="article:section" content="${categoryName}" />\n`;
    }

    if (videoUrl) {
        tags += `    <meta property="og:video" content="${videoUrl}" />\n`;
    }

    return tags;
};

/**
 * SEO Renderer Middleware
 * Fetches article/blog data and injects Open Graph meta tags into the HTML index file.
 * HARDENED: Always returns a valid response, even on DB/Data failure.
 */
const seoRenderer = async (req, res, next) => {
    const isArticle = req.path.startsWith('/article/');
    const isBlog = req.path.startsWith('/insight/');
    const isCategory = req.path.startsWith('/category/');

    // Only proceed for specific SEO routes
    if (!isArticle && !isBlog && !isCategory) {
        return next();
    }

    const DOMAIN = process.env.FRONTEND_URL || 'https://mitaanexpress.com';
    const siteName = 'Mitaan Express';
    let data = null;
    let identifier = '';

    try {
        identifier = req.params.slug || req.params.id || req.path.split('/').pop();
        let decodedId = identifier;
        try {
            decodedId = decodeURIComponent(identifier).trim();
        } catch (e) {
            // Silently handle decode errors
        }

        const isNumeric = /^\d+$/.test(decodedId);

        if (isArticle) {
            data = await prisma.article.findUnique({
                where: isNumeric ? { id: parseInt(decodedId) } : { slug: decodedId },
                select: {
                    title: true, shortDescription: true, image: true,
                    publishedAt: true, createdAt: true, updatedAt: true,
                    metaTitle: true, metaDescription: true, videoUrl: true,
                    category: { select: { name: true, nameHi: true } }
                }
            }).catch(err => {
                console.error('[SEO DB ERROR Article]', err.message);
                return null;
            });
        } else if (isBlog) {
            data = await prisma.blog.findUnique({
                where: isNumeric ? { id: parseInt(decodedId) } : { slug: decodedId },
                select: { title: true, shortDescription: true, image: true, updatedAt: true, createdAt: true }
            }).catch(err => {
                console.error('[SEO DB ERROR Blog]', err.message);
                return null;
            });
        } else if (isCategory) {
            data = await prisma.category.findUnique({
                where: isNumeric ? { id: parseInt(decodedId) } : { slug: decodedId },
                select: { name: true, nameHi: true, description: true, image: true }
            }).catch(err => {
                console.error('[SEO DB ERROR Category]', err.message);
                return null;
            });
            if (data) {
                data.title = data.name + ' News';
                data.shortDescription = data.description;
            }
        }
    } catch (error) {
        console.error('[SEO Renderer Catch]', error);
    }

    // FALLBACK LOGIC: If no data found, or DB failed, use generic but absolute defaults
    if (!data) {
        console.warn(`[SEO Fallback] Used for route: ${req.path}`);
        data = {
            title: siteName + ' - Latest News',
            shortDescription: 'Unbiased news, deep insights, and real-time updates from Mitaan Express.',
            image: 'https://img.freepik.com/free-vector/news-grunge-text_460848-9369.jpg?semt=ais_hybrid&w=740&q=80',
            createdAt: new Date()
        };
    }

    // SANITIZE & NORMALIZE
    const rawTitle = stripHtml(data.metaTitle || data.title || siteName);
    const cleanTitle = rawTitle.replace(/"/g, '&quot;');
    let cleanDesc = stripHtml(data.metaDescription || data.shortDescription || '').replace(/"/g, '&quot;');
    if (cleanDesc.length > 200) cleanDesc = cleanDesc.substring(0, 197) + '...';
    if (!cleanDesc) cleanDesc = 'Latest updates and investigative insights from Mitaan Express.';

    /**
     * Helper to resolve R2 and absolute image URLs
     * FORCED: Using provided R2 Public Base URL
     */
    const getValidImage = (image, domain) => {
        const R2_BASE = "https://pub-c3d6bb19e99a4f0dae3b620370bc1b9f.r2.dev/";
        const DEFAULT_IMAGE = "https://img.freepik.com/free-vector/news-grunge-text_460848-9369.jpg?semt=ais_hybrid&w=740&q=80";

        if (!image) return DEFAULT_IMAGE;
        
        // If it's already a full HTTP URL (Unsplash, External or R2)
        if (image.startsWith('http')) return image;
        
        // Skip base64 (fallback to logo)
        if (image.startsWith('data:')) return `${domain}/logo.png`;

        // Clean relative path and append to R2 base
        const cleanPath = image.startsWith('/') ? image.slice(1) : image;
        return `${R2_BASE}${cleanPath}`;
    };

    // Construct Image URL with absolute logic (Mixed format support)
    let imageUrl = getValidImage(data.image, DOMAIN);

    const pageUrl = `${DOMAIN}${req.path}`;
    const isoDate = new Date(data.publishedAt || data.createdAt || new Date()).toISOString();
    const modifiedDate = new Date(data.updatedAt || data.createdAt || new Date()).toISOString();
    const categoryName = data.category?.name || data.category?.nameHi || 'News';

    // Schema.org JSON-LD (Search Engines)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": isCategory ? "WebPage" : (isBlog ? "BlogPosting" : "NewsArticle"),
        "headline": cleanTitle,
        "description": cleanDesc,
        "image": [imageUrl],
        "datePublished": isoDate,
        "dateModified": modifiedDate,
        "publisher": { "@type": "Organization", "name": siteName, "logo": { "@type": "ImageObject", "url": `${DOMAIN}/logo.png` } }
    };

    // Prepare metadata for injection
    const metaTags = generateMetaTags({
        title: cleanTitle,
        description: cleanDesc,
        imageUrl, // Direct R2 URL for best reliability on WhatsApp
        pageUrl,
        siteName,
        isoDate,
        modifiedDate,
        imageAlt: cleanTitle,
        jsonLd,
        isCategory,
        categoryName,
        videoUrl: data.videoUrl
    });

    // LOAD INDEX.HTML
    const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
    let html = '';

    if (fs.existsSync(indexPath)) {
        html = fs.readFileSync(indexPath, 'utf8');
    } else {
        // ULTIMATE FALLBACK: Return a basic HTML shell if dist/index.html is missing
        html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><head><body><div id="root"></div></body></html>`;
    }

    // Clean existing tags
    html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
    html = html.replace(/<meta[^>]*?(?:name|property)=["'](?:description|og:|twitter:|article:)[^"']+["'][^>]*?>/gi, '');
    html = html.replace(/<link[^>]*?rel=["']canonical["'][^>]*?>/gi, '');
    html = html.replace(/<script[^>]*?type=["']application\/ld\+json["'][^>]*?>[\s\S]*?<\/script>/gi, '');

    // Inject
    html = html.replace('<head>', `<head>${metaTags}`);

    // Serve
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.header('Content-Type', 'text/html');
    return res.send(html);
};

module.exports = seoRenderer;
