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

// Note: prisma.$use() middleware is NOT supported with driver adapters in Prisma 7.x
// Query logging is handled via the `log` option above

// Graceful shutdown helper
async function disconnectPrisma() {
    await prisma.$disconnect();
    await pool.end();
}

module.exports = prisma;
module.exports.disconnectPrisma = disconnectPrisma;
