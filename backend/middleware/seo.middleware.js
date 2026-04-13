const fs = require('fs');
const path = require('path');
const prisma = require('../prisma');

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

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
        const parts = req.path.split('/').filter(Boolean);
        let identifier = parts.pop();

        if (!identifier) return next();
        
        // Decode identifier for Hindi/International characters
        try {
            identifier = decodeURIComponent(identifier).trim();
            console.log(`[SEO Renderer] Handling ${req.path} -> decoded identifier: "${identifier}"`);
        } catch (e) {
            console.warn('SEO Renderer: Failed to decode identifier', identifier);
        }

        let data = null;
        let contentType = 'article';
        const DOMAIN = process.env.FRONTEND_URL || 'https://mitaanexpress.com';

        if (isArticle) {
            const isNumeric = /^\d+$/.test(identifier);
            data = await prisma.article.findUnique({
                where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier },
                select: { title: true, shortDescription: true, image: true, updatedAt: true, metaTitle: true, metaDescription: true }
            });
        } else if (isBlog) {
            const isNumeric = /^\d+$/.test(identifier);
            data = await prisma.blog.findUnique({
                where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier },
                select: { title: true, shortDescription: true, image: true, updatedAt: true }
            });
        } else if (isCategory) {
            contentType = 'website';
            data = await prisma.category.findUnique({
                where: { slug: identifier },
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
            console.warn(`[SEO Renderer] No content found for identifier: "${identifier}"`);
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
        const title = (data.metaTitle || data.title || 'Mitaan Express').replace(/"/g, '&quot;');
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

        // Construct Meta Tags
        const metaTags = `
    <title>${title} | Mitaan Express</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="${isCategory ? 'website' : 'article'}" />
    <meta property="og:site_name" content="Mitaan Express" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:url" content="${pageUrl}" />
        `;

        // Robust removal of existing tags
        // This handles different attribute orders and self-closing styles
        html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["']description["'][^>]*?>/gi, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["']og:[^"']+["'][^>]*?>/gi, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["']twitter:[^"']+["'][^>]*?>/gi, '');

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
