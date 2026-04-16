const fs = require('fs');
const path = require('path');
const prisma = require('../prisma');
const { stripHtml } = require('../utils/sanitize');

/**
 * SEO Renderer Middleware
 * Fetches article/blog data and injects Open Graph meta tags into the HTML index file.
 * This is essential for social media bots that don't execute JavaScript.
 */
const seoRenderer = async (req, res, next) => {
    // Only handle GET requests for specific content routes
    const isArticle = req.path.startsWith('/article/');
    const isBlog = req.path.startsWith('/insight/');
    const isCategory = req.path.startsWith('/category/');

    if (!isArticle && !isBlog && !isCategory) {
        return next();
    }

    try {
        const identifier = req.params.slug || req.params.id;
        
        if (!identifier) {
            console.warn('[SEO Renderer] No identifier found in params');
            return next();
        }
        
        // Decode identifier for Hindi/International characters
        let decodedId = identifier;
        try {
            decodedId = decodeURIComponent(identifier).trim();
            console.log(`[SEO Renderer] Route: ${req.path} | Identifier: "${identifier}" | Decoded: "${decodedId}"`);
        } catch (e) {
            console.warn('[SEO Renderer] Decode failed for', identifier);
        }

        let data = null;
        let contentType = 'article';
        const DOMAIN = process.env.FRONTEND_URL || 'https://mitaanexpress.com';

        if (isArticle) {
            const isNumeric = /^\d+$/.test(decodedId);
            data = await prisma.article.findUnique({
                where: isNumeric ? { id: parseInt(decodedId) } : { slug: decodedId },
                select: {
                    title: true, shortDescription: true, image: true,
                    publishedAt: true, createdAt: true, updatedAt: true,
                    metaTitle: true, metaDescription: true,
                    category: { select: { name: true, nameHi: true } }
                }
            });
        } else if (isBlog) {
            const isNumeric = /^\d+$/.test(decodedId);
            data = await prisma.blog.findUnique({
                where: isNumeric ? { id: parseInt(decodedId) } : { slug: decodedId },
                select: { title: true, shortDescription: true, image: true, updatedAt: true }
            });
        } else if (isCategory) {
            contentType = 'website';
            const isNumeric = /^\d+$/.test(decodedId);
            data = await prisma.category.findUnique({
                where: isNumeric ? { id: parseInt(decodedId) } : { slug: decodedId },
                select: { name: true, nameHi: true, description: true, image: true }
            });
            if (data) {
                // Adapt category data to common structure
                data.title = data.name + ' News';
                data.shortDescription = data.description;
            }
        }

        // If no content found, let the frontend handle the 404
        if (!data) {
            console.warn(`[SEO Renderer] Data lookup failed in DB for "${decodedId}"`);
            return next();
        }
        console.log(`[SEO Renderer] Found content: "${data.title}"`);

        // Path to the built index.html
        const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
        
        if (!fs.existsSync(indexPath)) {
            console.warn('SEO Renderer: index.html not found at', indexPath);
            return next();
        }

        let html = fs.readFileSync(indexPath, 'utf8');

        // Prepare Meta Data
        const title = stripHtml(data.metaTitle || data.title || 'Mitaan Express').replace(/"/g, '&quot;');
        let description = stripHtml(data.metaDescription || data.shortDescription || data.title || '').replace(/"/g, '&quot;');
        if (description.length > 200) description = description.substring(0, 197) + '...';
        
        // Construct Image URL
        let imageUrl = data.image;
        if (imageUrl) {
            if (imageUrl.startsWith('data:')) {
                // Cannot share base64 images in OG tags effectively
                imageUrl = `${DOMAIN}/logo.png`;
            } else if (imageUrl.includes('images.unsplash.com')) {
                // Optimize for social media preview (1200 width)
                imageUrl = imageUrl.split('?')[0] + '?auto=format&fit=crop&q=80&w=1200';
            } else if (imageUrl.startsWith('http')) {
                // Already absolute (could be R2 or external)
                imageUrl = imageUrl;
            } else {
                // Handle relative paths (Local or R2)
                const R2_URL = process.env.R2_ACCOUNT_URL;
                const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
                
                if (R2_URL && (cleanPath.startsWith('media-') || !cleanPath.startsWith('uploads/'))) {
                    // It's likely an R2 upload if it has the media- prefix or isn't in uploads/
                    imageUrl = `${R2_URL}/${cleanPath}`;
                } else {
                    // Fallback to local domain
                    imageUrl = `${DOMAIN}/${cleanPath}`;
                }
            }
        } else {
            imageUrl = `${DOMAIN}/logo.png`; // Fallback image
        }

        const pageUrl = `${DOMAIN}${req.path}`;
        const siteName = 'Mitaan Express';
        const publishedDate = data.publishedAt || data.createdAt || data.updatedAt;
        const isoDate = publishedDate ? new Date(publishedDate).toISOString() : new Date().toISOString();
        const modifiedDate = data.updatedAt ? new Date(data.updatedAt).toISOString() : isoDate;

        // Schema.org JSON-LD for Times of India-style Rich Result
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": isCategory ? "WebPage" : (isBlog ? "BlogPosting" : "NewsArticle"),
            "headline": title,
            "description": description,
            "image": [imageUrl],
            "datePublished": isoDate,
            "dateModified": modifiedDate,
            "author": {
                "@type": "Organization",
                "name": siteName,
                "url": DOMAIN
            },
            "publisher": {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${DOMAIN}/logo.png`
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": pageUrl
            }
        };

        // Get category name for article:section
        const categoryName = data.category?.name || data.category?.nameHi || 'News';

        // Alt text for image
        const imageAlt = title;

        // Construct Meta Tags
        let metaTags = `
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
            metaTags += `    <meta property="article:published_time" content="${isoDate}" />\n`;
            metaTags += `    <meta property="article:modified_time" content="${modifiedDate}" />\n`;
            metaTags += `    <meta property="article:section" content="${categoryName}" />\n`;
        }

        if (data.videoUrl) {
            metaTags += `    <meta property="og:video" content="${data.videoUrl}" />\n`;
        }

        // Robust removal of existing tags to prevent duplication
        // This handles different attribute orders and self-closing styles
        html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["']description["'][^>]*?>/gi, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["']og:[^"']+["'][^>]*?>/gi, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["']twitter:[^"']+["'][^>]*?>/gi, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["']article:[^"']+["'][^>]*?>/gi, '');
        html = html.replace(/<link[^>]*?rel=["']canonical["'][^>]*?>/gi, '');
        // Remove existing JSON-LD scripts to prevent duplication
        html = html.replace(/<script[^>]*?type=["']application\/ld\+json["'][^>]*?>[\s\S]*?<\/script>/gi, '');

        // Inject new tags into <head>
        html = html.replace('<head>', `<head>${metaTags}`);

        // Set Cache Headers (1 hour public cache)
        res.setHeader('Cache-Control', 'public, max-age=3600');
        
        // Return the modified HTML
        res.header('Content-Type', 'text/html');
        return res.send(html);

    } catch (error) {
        console.error('SEO Renderer Error:', error);
        return next(); // Fallback to normal behavior on error
    }
};

module.exports = seoRenderer;
