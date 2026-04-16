# Mitaan Express - Production Deployment Guide

## 📁 Files Created

| File | Purpose |
|------|---------|
| `server.js` | Updated with global error handling, health check, process-level crash prevention |
| `prisma.js` | Enhanced with connection pool error handling, query logging, middleware |
| `ecosystem.config.js` | PM2 configuration with auto-restart, memory limits, logging |
| `deploy.sh` | Automated deployment script with health checks |
| `diagnose.sh` | Diagnostic tool for troubleshooting issues |
| `audit-prisma.js` | Scans for Prisma query issues |
| `nginx.conf` | NGINX configuration template |

---

## 🚀 QUICK START

### 1. Initial Server Setup

```bash
# On your VPS
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/mitaan-express
sudo chown $USER:$USER /var/www/mitaan-express

# Clone your repo
cd /var/www/mitaan-express
git clone https://github.com/yourusername/mitaan-express.git .
```

### 2. Environment Configuration

```bash
cd /var/www/mitaan-express/backend
cp .env.example .env
nano .env  # Edit with production values
```

**Required .env variables:**
```
DATABASE_URL="postgresql://user:pass@localhost:5432/mitaan?schema=public"
JWT_SECRET="your-256-bit-secret-here"
FRONTEND_URL="https://mitaanexpress.com"
NODE_ENV="production"
PORT=3000
```

### 3. First Deployment

```bash
cd /var/www/mitaan-express/backend

# Install dependencies
npm ci --production

# Database setup
npx prisma generate
npx prisma migrate deploy

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd
```

### 4. Configure NGINX

```bash
# Copy config
sudo cp /var/www/mitaan-express/backend/nginx.conf /etc/nginx/sites-available/mitaan-express

# Enable site
sudo ln -sf /etc/nginx/sites-available/mitaan-express /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.mitaanexpress.com
```

---

## 🔧 MAINTENANCE COMMANDS

### Deploy Updates
```bash
cd /var/www/mitaan-express/backend
./deploy.sh
```

### Check Status
```bash
./diagnose.sh
```

### View Logs
```bash
# PM2 logs
pm2 logs mitaan-api --lines 100

# Error logs
tail -f logs/error.log
tail -f ~/.pm2/logs/mitaan-api-error.log

# NGINX logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart backend
pm2 restart mitaan-api

# Restart NGINX
sudo systemctl restart nginx

# Hard restart (if stuck)
pm2 kill && pm2 start ecosystem.config.js --env production
```

---

## 🛡️ CRASH PREVENTION FEATURES

### Global Error Handling
All errors are caught and logged without crashing:
- Prisma validation errors → 400 response
- Database connection errors → 503 response
- Uncaught exceptions → Logged, app continues
- Unhandled rejections → Logged, app continues

### PM2 Auto-Restart
- Auto-restart on crash: Enabled
- Max restarts: 10 per 60 seconds
- Memory limit: 1GB (auto-restart if exceeded)
- Graceful shutdown: 5 second timeout

### Health Monitoring
```bash
# Health endpoint
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

---

## 🔍 TROUBLESHOOTING

### 502 Bad Gateway
```bash
# Diagnose
./diagnose.sh

# Most likely causes:
# 1. Backend crashed → pm2 restart mitaan-api
# 2. Port 3000 blocked → check firewall
# 3. Wrong proxy_pass → verify nginx.conf
```

### CORS Errors
```bash
# Test CORS headers
curl -I -X OPTIONS \
  -H "Origin: https://mitaanexpress.com" \
  -H "Access-Control-Request-Method: PUT" \
  https://api.mitaanexpress.com/api/blogs/39

# Should see: Access-Control-Allow-Origin: https://mitaanexpress.com
```

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Check pool status
# View logs: pm2 logs mitaan-api | grep PRISMA
```

### Prisma Validation Error
```bash
# Run audit
node audit-prisma.js

# Regenerate client
npx prisma generate
npx prisma migrate deploy
```

---

## 📊 MONITORING

### PM2 Dashboard
```bash
pm2 monit
```

### Check Resource Usage
```bash
pm2 status
free -h
df -h
```

### Automated Health Checks
Add to crontab:
```bash
# Check every 5 minutes, restart if health check fails
*/5 * * * * /var/www/mitaan-express/backend/health-check.sh
```

Create `health-check.sh`:
```bash
#!/bin/bash
if ! curl -sf https://api.mitaanexpress.com/health | grep -q '"status":"OK"'; then
    pm2 restart mitaan-api
    echo "$(date): Restarted due to failed health check" >> /var/log/mitaan-health.log
fi
```

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails:
```bash
# 1. Stop new version
pm2 stop mitaan-api

# 2. Revert git changes
cd /var/www/mitaan-express
git reset --hard HEAD~1

# 3. Reinstall dependencies
cd backend
npm ci --production
npx prisma generate

# 4. Restart
pm2 start ecosystem.config.js --env production
```

---

## ✅ DEPLOYMENT CHECKLIST

Before each deployment:

- [ ] `.env` has `NODE_ENV=production`
- [ ] `DATABASE_URL` is correct and database is accessible
- [ ] `FRONTEND_URL` matches production frontend domain
- [ ] Run `./diagnose.sh` - all checks pass
- [ ] Run `node audit-prisma.js` - no errors
- [ ] Run `./deploy.sh` - health check passes
- [ ] Test API endpoints manually:
  - [ ] `curl https://api.mitaanexpress.com/health`
  - [ ] `curl https://api.mitaanexpress.com/api/articles`
  - [ ] Test PUT request to update blog
- [ ] Monitor PM2 logs for 5 minutes: `pm2 logs mitaan-api`
- [ ] Check NGINX error logs: `sudo tail -f /var/log/nginx/error.log`

---

## 🆘 EMERGENCY CONTACTS

If all else fails:
```bash
# Full system restart
sudo systemctl restart nginx
pm2 kill
pm2 start /var/www/mitaan-express/backend/ecosystem.config.js --env production
pm2 save
```
