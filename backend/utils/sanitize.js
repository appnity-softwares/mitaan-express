/**
 * Strip all HTML tags from a string, leaving only plain text.
 * Used to sanitize title, metaTitle, shortDescription, etc.
 * Prevents HTML contamination in DB, OG meta tags, and social previews.
 */
const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return html;
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
};

/**
 * Sanitize an object's specified fields by stripping HTML.
 * Returns a new object with the specified fields cleaned.
 * @param {Object} obj - The object to sanitize
 * @param {string[]} fields - Array of field names to strip HTML from
 * @returns {Object} - The sanitized object (mutated in place and returned)
 */
const sanitizeFields = (obj, fields) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const field of fields) {
        if (obj[field] && typeof obj[field] === 'string') {
            obj[field] = stripHtml(obj[field]);
        }
    }
    return obj;
};

// Fields that should ALWAYS be plain text (no HTML)
const PLAIN_TEXT_FIELDS = ['title', 'shortDescription', 'metaTitle', 'metaDescription', 'authorName'];

module.exports = { stripHtml, sanitizeFields, PLAIN_TEXT_FIELDS };
