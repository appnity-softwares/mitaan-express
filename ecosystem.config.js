module.exports = {
    apps: [
        {
            name: 'mitaan-api',
            script: 'server.js',
            cwd: './backend',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_production: {
                NODE_ENV: 'production',
                PORT: 4000
            }
        }
    ]
};
