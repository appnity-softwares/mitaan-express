#!/bin/bash

# ============================================
# MITAAN EXPRESS - DIAGNOSTIC SCRIPT
# Run this to troubleshoot backend issues
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_DIR="/var/www/mitaan-express/backend"
API_URL="https://api.mitaanexpress.com"
PM2_APP_NAME="mitaan-api"

echo "========================================"
echo "  MITAAN EXPRESS DIAGNOSTIC TOOL"
echo "========================================"
echo ""

# Check if PM2 is running
echo -e "${BLUE}[CHECK]${NC} PM2 Process Status"
echo "----------------------------------------"
if pm2 list | grep -q "$PM2_APP_NAME"; then
    echo -e "${GREEN}✓${NC} PM2 process found"
    pm2 show "$PM2_APP_NAME" 2>/dev/null || true
else
    echo -e "${RED}✗${NC} PM2 process NOT FOUND"
fi
echo ""

# Check recent PM2 logs
echo -e "${BLUE}[CHECK]${NC} Recent PM2 Error Logs"
echo "----------------------------------------"
pm2 logs "$PM2_APP_NAME" --lines 20 --err 2>/dev/null || echo -e "${YELLOW}!${NC} Could not retrieve PM2 logs"
echo ""

# Check if port 3000 is in use
echo -e "${BLUE}[CHECK]${NC} Port 3000 Status"
echo "----------------------------------------"
if command -v lsof &> /dev/null; then
    if lsof -i :3000 | grep -q LISTEN; then
        echo -e "${GREEN}✓${NC} Port 3000 is in use:"
        lsof -i :3000 | grep LISTEN
    else
        echo -e "${RED}✗${NC} Port 3000 is NOT listening"
    fi
elif command -v ss &> /dev/null; then
    if ss -tlnp | grep -q ':3000'; then
        echo -e "${GREEN}✓${NC} Port 3000 is listening"
        ss -tlnp | grep ':3000'
    else
        echo -e "${RED}✗${NC} Port 3000 is NOT listening"
    fi
else
    echo -e "${YELLOW}!${NC} Cannot check port (lsof/ss not available)"
fi
echo ""

# Check database connectivity
echo -e "${BLUE}[CHECK]${NC} Database Connection"
echo "----------------------------------------"
cd "$BACKEND_DIR" 2>/dev/null || cd .
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL is set in .env"
    else
        echo -e "${RED}✗${NC} DATABASE_URL NOT found in .env"
    fi
else
    echo -e "${RED}✗${NC} .env file NOT found"
fi

# Test Prisma connection
if command -v npx &> /dev/null; then
    echo "Testing Prisma connection..."
    timeout 10 npx prisma db pull 2>&1 | head -5 || echo -e "${RED}✗${NC} Prisma connection test failed"
fi
echo ""

# Check health endpoint
echo -e "${BLUE}[CHECK]${NC} Health Endpoint"
echo "----------------------------------------"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/health" 2>/dev/null || echo -e "\nHTTP_CODE:000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
HTTP_BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Health check passed (HTTP 200)"
    echo "Response: $HTTP_BODY"
elif [ "$HTTP_CODE" = "503" ]; then
    echo -e "${YELLOW}!${NC} Health check returned 503 (Degraded)"
    echo "Response: $HTTP_BODY"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}✗${NC} Cannot connect to $API_URL"
    echo "   Check if backend is running and firewall allows port 443"
else
    echo -e "${RED}✗${NC} Health check failed (HTTP $HTTP_CODE)"
    echo "Response: $HTTP_BODY"
fi
echo ""

# Check NGINX
echo -e "${BLUE}[CHECK]${NC} NGINX Status"
echo "----------------------------------------"
if command -v nginx &> /dev/null; then
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✓${NC} NGINX config is valid"
    else
        echo -e "${RED}✗${NC} NGINX config test failed"
        sudo nginx -t 2>&1 || true
    fi
    
    if systemctl is-active --quiet nginx 2>/dev/null || service nginx status 2>/dev/null | grep -q running; then
        echo -e "${GREEN}✓${NC} NGINX is running"
    else
        echo -e "${RED}✗${NC} NGINX is NOT running"
    fi
else
    echo -e "${YELLOW}!${NC} NGINX not installed"
fi
echo ""

# Check SSL certificate
echo -e "${BLUE}[CHECK]${NC} SSL Certificate"
echo "----------------------------------------"
if command -v openssl &> /dev/null; then
    CERT_INFO=$(echo | openssl s_client -servername api.mitaanexpress.com -connect api.mitaanexpress.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || true)
    if [ -n "$CERT_INFO" ]; then
        echo -e "${GREEN}✓${NC} SSL certificate is valid"
        echo "$CERT_INFO"
    else
        echo -e "${RED}✗${NC} SSL certificate check failed"
    fi
else
    echo -e "${YELLOW}!${NC} Cannot check SSL (openssl not available)"
fi
echo ""

# Check for 502 errors
echo -e "${BLUE}[CHECK]${NC} 502 Bad Gateway Detection"
echo "----------------------------------------"
TEST_URL="$API_URL/api/articles?limit=1"
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")

if [ "$RESPONSE_CODE" = "502" ]; then
    echo -e "${RED}✗ DETECTED: 502 Bad Gateway${NC}"
    echo ""
    echo "Probable causes:"
    echo "  1. Backend crashed (check PM2 logs: pm2 logs mitaan-api)"
    echo "  2. Backend not running on port 3000"
    echo "  3. Firewall blocking connection"
    echo ""
    echo "Quick fixes:"
    echo "  pm2 restart mitaan-api"
    echo "  pm2 logs mitaan-api --lines 50"
elif [ "$RESPONSE_CODE" = "200" ] || [ "$RESPONSE_CODE" = "401" ] || [ "$RESPONSE_CODE" = "403" ]; then
    echo -e "${GREEN}✓${NC} API responding (HTTP $RESPONSE_CODE)"
else
    echo -e "${YELLOW}!${NC} API returned HTTP $RESPONSE_CODE"
fi
echo ""

# Disk space check
echo -e "${BLUE}[CHECK]${NC} System Resources"
echo "----------------------------------------"
df -h / | grep -v "Filesystem" | awk '{print "Disk usage: " $5 " (" $3 " used of " $2 ")"}'
free -h 2>/dev/null | grep "Mem:" | awk '{print "Memory: " $3 " used of " $2}' || echo "Memory: $(free -m 2>/dev/null | grep "Mem:" | awk '{print $3 "MB used of " $2 "MB"}')"
echo ""

# Summary
echo "========================================"
echo "  SUMMARY"
echo "========================================"
echo ""
echo "Common fixes:"
echo "  1. Restart backend:  pm2 restart mitaan-api"
echo "  2. View logs:        pm2 logs mitaan-api --lines 100"
echo "  3. Redeploy:         ./deploy.sh"
echo "  4. Check database:   npx prisma db pull"
echo "  5. Restart NGINX:    sudo systemctl restart nginx"
echo ""
echo "For detailed logs:"
echo "  Backend:  $BACKEND_DIR/logs/error.log"
echo "  PM2:      ~/.pm2/logs/"
echo "  NGINX:    /var/log/nginx/error.log"
echo ""
