module.exports = {
    apps: [{
        name: 'mitaan-api',
        script: './server.js',
        instances: 1,           // Single instance (scale to 'max' for cluster mode)
        exec_mode: 'fork',      // Use 'cluster' for multiple instances
        watch: false,           // Don't watch files in production
        max_memory_restart: '1G', // Restart if memory exceeds 1GB
        
        // Auto-restart configuration
        autorestart: true,
        restart_delay: 3000,    // Wait 3 seconds before restarting
        max_restarts: 10,       // Max 10 restarts in 60 seconds
        min_uptime: '10s',      // Must be up for 10s to count as stable
        
        // Logging
        log_file: './logs/combined.log',
        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        
        // Environment variables
        env: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        
        // Advanced PM2 features
        kill_timeout: 5000,     // 5 seconds to gracefully shutdown
        listen_timeout: 8000,   // 8 seconds to wait for server to start
        
        // Source map support for better error traces
        source_map_support: true,
        
        // Disable if you want to handle crashes manually
        // (we already have handlers in server.js)
        // instance_var: 'INSTANCE_ID'
    }]
};
