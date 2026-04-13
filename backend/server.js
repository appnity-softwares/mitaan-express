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
// Configure CORS
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mitaanexpress.com",
    "https://www.mitaanexpress.com",
    "https://api.mitaanexpress.com"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(null, false); // Don't pass an error, just deny and let the browser handle the absence of headers
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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

// SEO Injection for social sharing
const seoRenderer = require('./middleware/seo.middleware');
app.get(['/article/:id', '/insight/:slug', '/category/:id'], seoRenderer);

// Serve Static Frontend
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle React SPA Routing - Fallback to index.html
app.get('(.*)', (req, res) => {
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
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://mitaanexpress.com",
            "https://www.mitaanexpress.com"
        ],
        methods: ["GET", "POST"],
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
