module.exports = {
    apps: [{
        name: 'mitaan-api',
        script: './server.js',
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        max_memory_restart: '1G',
        
        // Auto-restart configuration
        autorestart: true,
        restart_delay: 4000,
        max_restarts: 10,
        min_uptime: '10s',
        
        // Logging
        log_file: './logs/combined.log',
        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        
        // Timeouts
        kill_timeout: 5000,
        listen_timeout: 10000,
        wait_ready: true,
        
        // Source map support
        source_map_support: true,
        
        // Health check
        health_check_grace_period: 3000,
        health_check_fatal_exceptions: true,
        
        // Environment variables - PORT must match .env and NGINX
        env: {
            NODE_ENV: 'development',
            PORT: 4000,
            PM2_HOME: '.pm2'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 4000,
            PM2_HOME: '.pm2'
        },
        
        // Memory and CPU monitoring
        max_cpu_restart: '90%',
        
        // Node.js specific
        node_args: '--max-old-space-size=1024',
        
        // Process monitoring
        pmx: false,
        
        instance_var: 'INSTANCE_ID'
    }]
};
