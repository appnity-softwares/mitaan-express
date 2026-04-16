const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

require('dotenv').config();

// Connection pool with error handling
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20,                // Maximum pool size
    idleTimeoutMillis: 30000, // Close idle clients after 30s
    connectionTimeoutMillis: 2000, // Return error after 2s if no connection
});

// Handle pool errors - prevents crash on DB connection issues
pool.on('error', (err) => {
    console.error('[PRISMA] Unexpected database pool error:', err);
    // Don't exit - let app handle reconnection
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn']
});

// Middleware: Log all queries in development
prisma.$use(async (params, next) => {
    const start = Date.now();
    try {
        const result = await next(params);
        const duration = Date.now() - start;
        
        // Log slow queries (> 1 second)
        if (duration > 1000) {
            console.warn('[PRISMA SLOW QUERY]', {
                model: params.model,
                action: params.action,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString()
            });
        }
        
        return result;
    } catch (error) {
        // Log query errors with context
        console.error('[PRISMA QUERY ERROR]', {
            model: params.model,
            action: params.action,
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        });
        
        // Re-throw to be caught by controller
        throw error;
    }
});

// Graceful shutdown helper
async function disconnectPrisma() {
    await prisma.$disconnect();
    await pool.end();
}

module.exports = prisma;
module.exports.disconnectPrisma = disconnectPrisma;
