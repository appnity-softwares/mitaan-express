require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const compression = require('compression');
const { Server } = require('socket.io');
const http = require('http');

const prisma = require('./prisma');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ============================================
// BASIC MIDDLEWARE
// ============================================
app.use(compression());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ============================================
// CORS CONFIGURATION - EXPRESS 5 SAFE
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mitaanexpress.com',
  'https://www.mitaanexpress.com',
  process.env.FRONTEND_URL
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow curl, mobile apps, server-to-server

  return allowedOrigins.some((allowed) => {
    if (!allowed) return false;
    try {
      return new URL(origin).origin === new URL(allowed).origin;
    } catch {
      return origin === allowed;
    }
  });
};

// Preflight handler
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next();

  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  return res.status(403).json({ error: 'CORS origin not allowed' });
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400
  })
);

// ============================================
// ROUTES
// ============================================
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
const publisherRoutes = require('./routes/publisher.routes');

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
app.use('/api/publishers', publisherRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {}
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'connected';
  } catch (err) {
    health.checks.database = `error: ${err.message}`;
    health.status = 'DEGRADED';
  }

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.dbResponseTime = `${Date.now() - dbStart}ms`;
  } catch (err) {
    health.checks.dbResponseTime = 'failed';
  }

  res.status(health.status === 'OK' ? 200 : 503).json(health);
});

// ============================================
// API 404 HANDLER
// EXPRESS 5 SAFE: DO NOT USE /api/:path*
// ============================================
app.use('/api', (req, res) => {
  return res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// ============================================
// FRONTEND & SEO SERVING - EXPRESS 5 SAFE
// DO NOT USE app.get('*')
// ============================================
const frontendPath = path.join(__dirname, '../frontend/dist');
const seoRenderer = require('./middleware/seo.middleware');

// Static assets first
app.use(express.static(frontendPath, { index: false }));

// SEO render only for non-API and non-file routes
app.get(/^(?!\/api\/)(?!.*\.).*/, (req, res, next) => {
  return seoRenderer(req, res, next);
});

// SPA fallback for frontend routes
app.get(/^(?!\/api\/).*/, (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.send('Mitaan Express API is running (Frontend build not found)');
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

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

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON in request body'
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS error',
      code: 'CORS_BLOCKED'
    });
  }

  return res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: err.code || 'INTERNAL_ERROR'
  });
});

// ============================================
// SOCKET.IO
// ============================================
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  io.emit('activeUsers', activeUsers);

  socket.on('disconnect', () => {
    activeUsers = Math.max(0, activeUsers - 1);
    io.emit('activeUsers', activeUsers);
  });
});

io.engine.on('connection_error', (err) => {
  console.error('Socket.io Connection Error:', err);
});

// ============================================
// START SERVER
// ============================================
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ============================================
// PROCESS-LEVEL ERROR HANDLING
// ============================================
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  if (err.message && err.message.includes('Cannot find module')) {
    console.error('[FATAL] Module loading error - shutting down');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const gracefulShutdown = async (signal) => {
  console.log(`[SHUTDOWN] ${signal} received - closing server gracefully`);

  server.close(async () => {
    console.log('[SHUTDOWN] HTTP server closed');

    try {
      await prisma.$disconnect();
      console.log('[SHUTDOWN] Database disconnected');
    } catch (error) {
      console.error('[SHUTDOWN] Error disconnecting database:', error);
    }

    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));