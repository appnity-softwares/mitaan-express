module.exports = {
    apps: [{
        name: 'mitaan-api',
        script: './server.js',
        instances: 1,           // Single instance (scale to 'max' for cluster mode)
        exec_mode: 'fork',      // Use 'cluster' for multiple instances
        watch: false,           // Don't watch files in production
        max_memory_restart: '1G', // Restart if memory exceeds 1GB
        
        // Auto-restart configuration - Production hardened
        autorestart: true,
        restart_delay: 3000,    // Wait 3 seconds before restarting
        max_restarts: 10,       // Max 10 restarts in 60 seconds
        min_uptime: '10s',      // Must be up for 10s to count as stable
        restart_delay: 4000,    // Increased delay for stability
        
        // Logging - Production ready
        log_file: './logs/combined.log',
        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        
        // Advanced PM2 features - Hardened
        kill_timeout: 5000,     // 5 seconds to gracefully shutdown
        listen_timeout: 8000,   // 8 seconds to wait for server to start
        wait_ready: true,       // Wait for app to be ready
        listen_timeout: 10000,   // 10 seconds startup timeout
        
        // Source map support for better error traces
        source_map_support: true,
        
        // Health check - Auto-restart on failure
        health_check_grace_period: 3000,
        health_check_fatal_exceptions: true,
        
        // Environment variables
        env: {
            NODE_ENV: 'development',
            PORT: 3000,
            PM2_HOME: '.pm2'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000,
            PM2_HOME: '.pm2'
        },
        
        // Memory and CPU monitoring
        max_cpu_restart: '90%',  // Restart if CPU > 90%
        
        // Error handling
        error_file: './logs/error.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        
        // Node.js specific
        node_args: '--max-old-space-size=1024',
        
        // Timeouts
        kill_timeout: 5000,
        listen_timeout: 10000,
        
        // Process monitoring
        pmx: false,             // Disable PMX for production (security)
        
        // Cluster mode settings (if instances > 1)
        instance_var: 'INSTANCE_ID'
    }]
};
