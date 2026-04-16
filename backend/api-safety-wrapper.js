/**
 * API SAFETY WRAPPER
 * 
 * Wraps all API endpoints with crash prevention:
 * - Input validation
 * - Error boundaries
 * - Response standardization
 * - Rate limiting
 */

const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Input validation helpers
const validators = {
    // Pagination validation
    pagination: (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        if (page < 1 || page > 10000) {
            return res.status(400).json({ error: 'Page must be between 1 and 10000' });
        }
        
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'Limit must be between 1 and 100' });
        }
        
        req.validatedQuery = {
            ...req.query,
            page: Math.min(page, 10000),
            limit: Math.min(limit, 100)
        };
        next();
    },
    
    // ID validation
    id: (paramName = 'id') => (req, res, next) => {
        const id = req.params[paramName];
        const numId = parseInt(id);
        
        if (isNaN(numId) || numId < 1 || numId > 2147483647) {
            return res.status(400).json({ error: `Invalid ${paramName}: must be a positive integer` });
        }
        
        req.validatedParams = { ...req.validatedParams, [paramName]: numId };
        next();
    },
    
    // Slug validation
    slug: (paramName = 'slug') => (req, res, next) => {
        const slug = req.params[paramName];
        
        if (!slug || typeof slug !== 'string') {
            return res.status(400).json({ error: `Invalid ${paramName}: must be a string` });
        }
        
        if (slug.length > 255) {
            return res.status(400).json({ error: `${paramName} too long (max 255 characters)` });
        }
        
        req.validatedParams = { ...req.validatedParams, [paramName]: slug };
        next();
    },
    
    // Search validation
    search: (req, res, next) => {
        const search = req.query.search;
        
        if (search && typeof search === 'string') {
            if (search.length > 500) {
                return res.status(400).json({ error: 'Search query too long (max 500 characters)' });
            }
            
            // Sanitize search query
            req.validatedQuery = {
                ...req.query,
                search: search.substring(0, 500)
            };
        }
        
        next();
    }
};

// Error boundary wrapper
function errorHandler(fn) {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            console.error('[API ERROR]', {
                method: req.method,
                path: req.path,
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            // Handle specific error types
            if (error.name === 'PrismaClientValidationError') {
                return res.status(400).json({
                    error: 'Invalid query parameters',
                    code: 'VALIDATION_ERROR',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
            
            if (error.name === 'PrismaClientKnownRequestError') {
                const errorMap = {
                    'P2002': 'Duplicate entry',
                    'P2025': 'Record not found',
                    'P2003': 'Foreign key constraint failed',
                    'P2014': 'Relation violation'
                };
                
                return res.status(400).json({
                    error: errorMap[error.code] || 'Database operation failed',
                    code: error.code,
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
            
            if (error.name === 'PrismaClientInitializationError') {
                return res.status(503).json({
                    error: 'Database connection failed',
                    code: 'DB_CONNECTION_ERROR'
                });
            }
            
            if (error.message && error.message.includes('timeout')) {
                return res.status(504).json({
                    error: 'Request timeout',
                    code: 'TIMEOUT_ERROR'
                });
            }
            
            // Default error response
            res.status(500).json({
                error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
                code: 'INTERNAL_ERROR'
            });
        }
    };
}

// Response standardization
function standardResponse(data, message = null, meta = null) {
    const response = { success: true };
    
    if (data !== null && data !== undefined) {
        response.data = data;
    }
    
    if (message) {
        response.message = message;
    }
    
    if (meta) {
        response.meta = meta;
    }
    
    return response;
}

// Validation middleware for create/update operations
function validateBlogData(req, res, next) {
    const { title, content, categoryId, status, language } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    
    if (title.length > 500) {
        return res.status(400).json({ error: 'Title too long (max 500 characters)' });
    }
    
    if (content && typeof content === 'string' && content.length > 1000000) {
        return res.status(400).json({ error: 'Content too long (max 1MB)' });
    }
    
    if (categoryId !== undefined && categoryId !== null) {
        const numId = parseInt(categoryId);
        if (isNaN(numId) || numId < 1) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }
        req.body.categoryId = numId;
    }
    
    if (status && !['DRAFT', 'PUBLISHED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be DRAFT or PUBLISHED' });
    }
    
    if (language && typeof language === 'string' && language.length > 10) {
        return res.status(400).json({ error: 'Language code too long (max 10 characters)' });
    }
    
    next();
}

function validateArticleData(req, res, next) {
    const { title, content, categoryId, status, language } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    
    if (title.length > 500) {
        return res.status(400).json({ error: 'Title too long (max 500 characters)' });
    }
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
    }
    
    if (content.length > 1000000) {
        return res.status(400).json({ error: 'Content too long (max 1MB)' });
    }
    
    if (!categoryId || isNaN(parseInt(categoryId))) {
        return res.status(400).json({ error: 'Valid category ID is required' });
    }
    
    if (status && !['DRAFT', 'PUBLISHED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be DRAFT or PUBLISHED' });
    }
    
    if (language && typeof language === 'string' && language.length > 10) {
        return res.status(400).json({ error: 'Language code too long (max 10 characters)' });
    }
    
    next();
}

function validateCategoryData(req, res, next) {
    const { name, nameHi, slug, sortOrder, parentId } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    
    if (name.length > 100) {
        return res.status(400).json({ error: 'Name too long (max 100 characters)' });
    }
    
    if (nameHi && typeof nameHi === 'string' && nameHi.length > 100) {
        return res.status(400).json({ error: 'Hindi name too long (max 100 characters)' });
    }
    
    if (slug && typeof slug === 'string') {
        if (slug.length > 100) {
            return res.status(400).json({ error: 'Slug too long (max 100 characters)' });
        }
    }
    
    if (sortOrder !== undefined) {
        const numSort = parseInt(sortOrder);
        if (isNaN(numSort) || numSort < 0 || numSort > 99999) {
            return res.status(400).json({ error: 'Sort order must be between 0 and 99999' });
        }
        req.body.sortOrder = numSort;
    }
    
    if (parentId !== undefined && parentId !== null) {
        const numId = parseInt(parentId);
        if (isNaN(numId) || numId < 1) {
            return res.status(400).json({ error: 'Invalid parent ID' });
        }
        req.body.parentId = numId;
    }
    
    next();
}

module.exports = {
    apiLimiter,
    validators,
    errorHandler,
    standardResponse,
    validateBlogData,
    validateArticleData,
    validateCategoryData
};
