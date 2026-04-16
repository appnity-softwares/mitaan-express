require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const compression = require('compression');
const prisma = require('./prisma');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());

// ============================================
// CORS CONFIGURATION - PRODUCTION SAFE
// ============================================
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mitaanexpress.com",
    "https://www.mitaanexpress.com",
    process.env.FRONTEND_URL
].filter(Boolean);

// Pre-flight OPTIONS handler - Express 5 compatible
app.use((req, res, next) => {
    if (req.method !== 'OPTIONS') return next();
    const origin = req.headers.origin;
    const isAllowed = !origin || allowedOrigins.some(allowed => {
        if (!allowed) return false;
        try {
            return new URL(origin).origin === new URL(allowed).origin;
        } catch {
            return origin === allowed;
        }
    });

    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.status(204).end();
});

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowed => {
            if (!allowed) return false;
            try {
                return new URL(origin).origin === new URL(allowed).origin;
            } catch {
                return origin === allowed;
            }
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            // Return the origin anyway to avoid browser errors, but log it
            callback(null, allowedOrigins[0] || 'https://mitaanexpress.com');
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours - reduce preflight requests
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
const authRoutes = require('./routes/auth.routes');
const articleRoutes = require('./routes/article.routes');
const categoryRoutes = require('./routes/category.routes');
const adminRoutes = require('./routes/admin.routes');
const settingsRoutes = require('./routes/settings.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const activityRoutes = require('./routes/activity.routes');
const blogRoutes = require('./routes/blog.routes');
const mediaRoutes = require('./routes/media.routes');
const donationRoutes = require('./routes/donation.routes');
const contactRoutes = require('./routes/contact.routes');
const searchRoutes = require('./routes/search.routes');
const seoRoutes = require('./routes/seo.routes');


app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/seo', seoRoutes);

// ============================================
// HEALTH CHECK ENDPOINT - For monitoring & deploy verification
// ============================================
app.get('/health', async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks: {}
    };

    // Database connectivity check
    try {
        await prisma.$queryRaw`SELECT 1`;
        health.checks.database = 'connected';
    } catch (err) {
        health.checks.database = `error: ${err.message}`;
        health.status = 'DEGRADED';
    }

    // Response time check
    const dbStart = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        health.checks.dbResponseTime = `${Date.now() - dbStart}ms`;
    } catch (err) {
        health.checks.dbResponseTime = 'failed';
    }

    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
});

// ============================================
// GLOBAL ERROR HANDLING - Prevents app crashes
// ============================================

// 404 handler for unknown API routes
app.use('/api/{*path}', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
});

// Global error handler - catches all unhandled errors
app.use((err, req, res, next) => {
    // Log the error with full details
    console.error('[GLOBAL ERROR]', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (err.name === 'PrismaClientValidationError') {
        return res.status(400).json({
            error: 'Database query error',
            code: 'PRISMA_VALIDATION_ERROR',
            message: process.env.NODE_ENV === 'production' ? 'Invalid query parameters' : err.message
        });
    }

    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            error: 'Database request error',
            code: err.code,
            message: process.env.NODE_ENV === 'production' ? 'Database operation failed' : err.message
        });
    }

    if (err.name === 'PrismaClientInitializationError') {
        return res.status(503).json({
            error: 'Database connection failed',
            code: 'DB_CONNECTION_ERROR',
            message: 'Service temporarily unavailable'
        });
    }

    // SyntaxError (malformed JSON)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }

    // Default error response
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        code: err.code || 'INTERNAL_ERROR'
    });
});

// SEO Injection for social sharing
const seoRenderer = require('./middleware/seo.middleware');
app.get(['/article/:id', '/insight/:slug', '/category/:id'], seoRenderer);

// Serve Static Frontend
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle React SPA Routing - Fallback to index.html
app.get('{/*path}', (req, res) => {
    // Skip API routes that might have reached here erroneously
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    // If frontend build exists, serve it
    if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.send('Mitaan Express API is running (Frontend build not found)');
    }
});

const { Server } = require("socket.io");
const http = require('http').createServer(app);
const io = new Server(http, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    }
});

let activeUsers = 0;

io.on('connection', (socket) => {
    activeUsers++;
    io.emit('activeUsers', activeUsers);

    socket.on('disconnect', () => {
        activeUsers--;
        io.emit('activeUsers', activeUsers);
    });
});

io.engine.on("connection_error", (err) => {
    console.error("Socket.io Connection Error:", err);
});

http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// ============================================
// PROCESS-LEVEL ERROR HANDLING - Prevents crashes
// ============================================

// Handle uncaught exceptions - prevents app crash
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
    // Keep running - only exit on truly fatal errors
    if (err.message && err.message.includes('Cannot find module')) {
        console.error('[FATAL] Module loading error - shutting down');
        process.exit(1);
    }
});

// Handle unhandled promise rejections - prevents app crash
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
    // Log but don't exit - let the app continue
});

// Handle SIGTERM for graceful shutdown (PM2 sends this)
process.on('SIGTERM', async () => {
    console.log('[SHUTDOWN] SIGTERM received - closing server gracefully');
    http.close(() => {
        console.log('[SHUTDOWN] HTTP server closed');
    });
    await prisma.$disconnect();
    console.log('[SHUTDOWN] Database disconnected');
    process.exit(0);
});

// Handle SIGINT for graceful shutdown (Ctrl+C)
process.on('SIGINT', async () => {
    console.log('[SHUTDOWN] SIGINT received - closing server gracefully');
    http.close(() => {
        console.log('[SHUTDOWN] HTTP server closed');
    });
    await prisma.$disconnect();
    console.log('[SHUTDOWN] Database disconnected');
    process.exit(0);
});
