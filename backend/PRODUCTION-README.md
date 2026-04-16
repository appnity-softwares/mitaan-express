# Production Deployment Guide

## Overview

This document provides a complete production-ready setup for the Mitaan Express backend with zero-downtime deployment, crash prevention, and automatic recovery.

## Architecture

```
Frontend (React) <---> NGINX <---> Backend (Node.js + Prisma) <---> PostgreSQL
                                   |
                                PM2 (Process Manager)
```

## Key Features

### 1. Crash Prevention
- Global error handling middleware
- Process-level error handlers
- Input validation on all endpoints
- Safe Prisma queries (no select+include conflicts)

### 2. Auto-Recovery
- PM2 auto-restart on crash
- Memory limit monitoring (1GB)
- CPU monitoring (90% threshold)
- Health check endpoint

### 3. Zero-Downtime Deployment
- Blue-green deployment strategy
- Automatic rollback on failure
- Health verification before/after deployment

## Quick Start

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install NGINX
sudo apt install -y nginx

# Create app directory
sudo mkdir -p /var/www/mitaan-express
sudo chown $USER:$USER /var/www/mitaan-express
```

### 2. Clone Repository

```bash
cd /var/www/mitaan-express
git clone https://github.com/yourusername/mitaan-express.git .
```

### 3. Environment Configuration

```bash
cd backend
cp .env.example .env
nano .env
```

Required variables:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mitaan?schema=public"
JWT_SECRET="your-256-bit-secret"
FRONTEND_URL="https://mitaanexpress.com"
NODE_ENV="production"
PORT=3000
```

### 4. Database Setup

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE mitaan;
CREATE USER mitaan_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mitaan TO mitaan_user;
\q

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

### 5. SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.mitaanexpress.com -d mitaanexpress.com
```

## Deployment Commands

### Safe Deployment (Recommended)

```bash
cd /var/www/mitaan-express/backend
./deploy-safe.sh
```

### Manual Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate deploy

# 5. Restart PM2
pm2 restart mitaan-api
```

### Quick Restart

```bash
pm2 restart mitaan-api
```

## Monitoring

### Health Check

```bash
# Check backend health
curl https://api.mitaanexpress.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "checks": {
    "database": "connected",
    "dbResponseTime": "5ms"
  }
}
```

### PM2 Status

```bash
# View process status
pm2 status

# View logs
pm2 logs mitaan-api

# View error logs
pm2 logs mitaan-api --err

# Monitor dashboard
pm2 monit
```

### NGINX Status

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### 502 Bad Gateway

```bash
# 1. Check PM2 status
pm2 status

# 2. Check backend logs
pm2 logs mitaan-api --err --lines 50

# 3. Restart backend
pm2 restart mitaan-api

# 4. Check health endpoint
curl http://localhost:3000/health
```

### Database Connection Issues

```bash
# 1. Test database connection
npx prisma db pull

# 2. Check PostgreSQL status
sudo systemctl status postgresql

# 3. View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### High Memory Usage

```bash
# 1. Check memory usage
pm2 monit

# 2. Restart to clear memory
pm2 restart mitaan-api

# 3. Check for memory leaks
pm2 logs mitaan-api | grep "memory"
```

## Configuration Files

### PM2 Ecosystem (`ecosystem.config.js`)

- Auto-restart on crash
- Memory limit: 1GB
- CPU monitoring: 90%
- Graceful shutdown: 5s
- Health checks enabled

### NGINX Config (`nginx-production.conf`)

- Rate limiting: 10req/s
- Proxy timeouts: 75s
- SSL/TLS enabled
- Error handling for 502/503/504
- WebSocket support

### Health Endpoint (`/health`)

- Database connectivity test
- Response time monitoring
- Server uptime tracking
- Memory usage reporting

## Security

### 1. Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### 2. SSL/TLS

- Automatic certificate renewal
- Strong cipher suites
- HSTS headers
- Secure cookies

### 3. Rate Limiting

- API: 10 requests/second
- Health endpoint: 30 requests/second
- Burst protection enabled

## Backup Strategy

### Database Backup

```bash
# Create backup script
cat > /home/user/scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mitaan"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump mitaan > "$BACKUP_DIR/mitaan-$DATE.sql"
gzip "$BACKUP_DIR/mitaan-$DATE.sql"

# Keep last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /home/user/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /home/user/scripts/backup-db.sh" | crontab -
```

### Code Backup

```bash
# Backup before deployment
cp -r /var/www/mitaan-express /var/backups/mitaan-code-$(date +%Y%m%d-%H%M%S)
```

## Performance Optimization

### 1. Database

```sql
-- Add indexes for common queries
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(categoryId);
CREATE INDEX idx_articles_created ON articles(createdAt);
CREATE INDEX idx_blogs_status ON blogs(status);
```

### 2. Caching

```bash
# Install Redis for caching
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set maxmemory and maxmemory-policy
```

### 3. CDN

Configure Cloudflare or similar CDN for:
- Static assets
- API responses
- DDoS protection

## Alerts and Monitoring

### 1. Uptime Monitoring

```bash
# Add to crontab (every 5 minutes)
*/5 * * * * curl -f https://api.mitaanexpress.com/health || echo "Backend down" | mail -s "Mitaan Backend Alert" admin@example.com
```

### 2. Log Monitoring

```bash
# Monitor error logs
tail -f /var/www/mitaan-express/backend/logs/error.log

# Monitor NGINX logs
tail -f /var/log/nginx/error.log
```

### 3. Resource Monitoring

```bash
# Install htop
sudo apt install -y htop

# Monitor system resources
htop

# Monitor PM2 processes
pm2 monit
```

## Emergency Procedures

### 1. Full System Restart

```bash
# Restart everything
sudo systemctl restart nginx
pm2 kill && pm2 start ecosystem.config.js --env production
sudo systemctl restart postgresql
```

### 2. Emergency Rollback

```bash
# Find latest backup
ls -la /var/backups/mitaan-code-*

# Restore backup
sudo systemctl stop nginx
pm2 kill
rm -rf /var/www/mitaan-express
cp -r /var/backups/mitaan-code-YYYYMMDD-HHMMSS /var/www/mitaan-express
cd /var/www/mitaan-express/backend
pm2 start ecosystem.config.js --env production
sudo systemctl start nginx
```

### 3. Database Recovery

```bash
# Restore from backup
gunzip /var/backups/mitaan/mitaan-YYYYMMDD-HHMMSS.sql.gz
psql mitaan < /var/backups/mitaan/mitaan-YYYYMMDD-HHMMSS.sql
```

## Maintenance Schedule

### Daily
- Check health endpoint
- Review error logs
- Monitor resource usage

### Weekly
- Check SSL certificate expiry
- Review backup logs
- Update security patches

### Monthly
- Database maintenance
- Log rotation cleanup
- Performance review

## Support

For issues:
1. Check logs: `pm2 logs mitaan-api --err`
2. Run diagnostic: `./diagnose.sh`
3. Check health: `curl /health`
4. Review this documentation

## Version History

- v1.0: Initial production setup
- v1.1: Added zero-downtime deployment
- v1.2: Enhanced error handling
- v1.3: Added comprehensive monitoring
