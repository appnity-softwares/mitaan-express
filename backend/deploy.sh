#!/bin/bash

# ============================================
# MITAAN EXPRESS - VPS AUTO-DEPLOY SCRIPT
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/var/www/mitaan-express/backend"
FRONTEND_DIR="/var/www/mitaan-express/frontend"
API_URL="https://api.mitaanexpress.com"
HEALTH_ENDPOINT="$API_URL/health"
PM2_APP_NAME="mitaan-api"

# Track failures
ERRORS=()

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ERRORS+=("$1")
}

# ============================================
# PRE-FLIGHT CHECKS
# ============================================

echo "========================================"
echo "  MITAAN EXPRESS DEPLOYMENT SCRIPT"
echo "========================================"
echo ""

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    log_warning "Running as root. Consider using a non-root user for security."
fi

# Check required commands
for cmd in git node npm pm2 curl; do
    if ! command -v $cmd &> /dev/null; then
        log_error "$cmd is required but not installed"
    fi
done

if [ ${#ERRORS[@]} -ne 0 ]; then
    echo ""
    log_error "Missing required commands. Install them first."
    exit 1
fi

# Check PM2 status before deploy
log_info "Checking current PM2 status..."
pm2 list || true

# ============================================
# BACKEND DEPLOYMENT
# ============================================

echo ""
echo "========================================"
echo "  DEPLOYING BACKEND"
echo "========================================"
echo ""

if [ -d "$BACKEND_DIR" ]; then
    log_info "Pulling latest code..."
    cd "$BACKEND_DIR"
    
    # Stash any local changes
    git stash || true
    
    # Pull latest
    if git pull origin main; then
        log_success "Code updated successfully"
    else
        log_error "Failed to pull latest code"
    fi
else
    log_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Install dependencies
log_info "Installing dependencies..."
if npm ci --production; then
    log_success "Dependencies installed"
else
    log_warning "npm ci failed, trying npm install..."
    if npm install; then
        log_success "Dependencies installed (via npm install)"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
fi

# Generate Prisma client
log_info "Generating Prisma client..."
if npx prisma generate; then
    log_success "Prisma client generated"
else
    log_error "Failed to generate Prisma client"
    exit 1
fi

# Run database migrations
log_info "Running database migrations..."
if npx prisma migrate deploy; then
    log_success "Database migrations completed"
else
    log_error "Database migration failed"
    log_info "Continuing deployment (app may still work)..."
fi

# Create logs directory if not exists
mkdir -p logs

# ============================================
# PM2 DEPLOYMENT
# ============================================

echo ""
log_info "Starting/Restarting PM2..."

# Check if app exists in PM2
if pm2 list | grep -q "$PM2_APP_NAME"; then
    log_info "Restarting existing PM2 process..."
    if pm2 restart "$PM2_APP_NAME"; then
        log_success "PM2 process restarted"
    else
        log_error "Failed to restart PM2 process"
        exit 1
    fi
else
    log_info "Starting new PM2 process..."
    cd "$BACKEND_DIR"
    if pm2 start ecosystem.config.js --env production; then
        log_success "PM2 process started"
    else
        log_error "Failed to start PM2 process"
        exit 1
    fi
fi

# Save PM2 config
pm2 save

# Wait for server to start
log_info "Waiting for server to start..."
sleep 5

# ============================================
# HEALTH CHECKS
# ============================================

echo ""
echo "========================================"
echo "  RUNNING HEALTH CHECKS"
echo "========================================"
echo ""

HEALTH_OK=false
RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $RETRIES ]; do
    log_info "Health check attempt $((RETRY_COUNT + 1))/$RETRIES..."
    
    # Check if PM2 process is running
    if ! pm2 list | grep -q "$PM2_APP_NAME"; then
        log_error "PM2 process is not running"
        break
    fi
    
    # Check HTTP health endpoint
    HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo -e "\n000")
    HTTP_BODY=$(echo "$HTTP_RESPONSE" | head -n1)
    HTTP_STATUS=$(echo "$HTTP_RESPONSE" | tail -n1)
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        log_success "Health check passed (HTTP 200)"
        log_info "Response: $HTTP_BODY"
        HEALTH_OK=true
        break
    elif [ "$HTTP_STATUS" -eq 503 ]; then
        log_warning "Health check returned 503 (Degraded) - database may be starting up"
        log_info "Response: $HTTP_BODY"
        # Still acceptable, wait for recovery
        sleep 3
    elif [ "$HTTP_STATUS" -eq 000 ]; then
        log_warning "Cannot connect to server (Connection refused/timeout)"
        sleep 3
    else
        log_warning "Health check returned HTTP $HTTP_STATUS"
        log_info "Response: $HTTP_BODY"
        sleep 3
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# ============================================
# NGINX VALIDATION
# ============================================

echo ""
echo "========================================"
echo "  NGINX VALIDATION"
echo "========================================"
echo ""

# Test nginx configuration
if command -v nginx &> /dev/null; then
    log_info "Testing NGINX configuration..."
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        log_success "NGINX configuration is valid"
        
        log_info "Reloading NGINX..."
        if sudo systemctl reload nginx || sudo service nginx reload; then
            log_success "NGINX reloaded"
        else
            log_warning "Failed to reload NGINX (may need manual check)"
        fi
    else
        log_error "NGINX configuration test failed"
        sudo nginx -t
    fi
else
    log_warning "NGINX not found on this server"
fi

# ============================================
# 502 ERROR DETECTION
# ============================================

echo ""
echo "========================================"
echo "  502 ERROR DETECTION"
echo "========================================"
echo ""

# Check for 502 from API endpoint (not /health which has its own error handling)
TEST_ENDPOINT="$API_URL/api/articles?limit=1"
API_RESPONSE=$(curl -s -w "\n%{http_code}" "$TEST_ENDPOINT" 2>/dev/null || echo -e "\n000")
API_STATUS=$(echo "$API_RESPONSE" | tail -n1)

case $API_STATUS in
    200)
        log_success "API endpoint test passed (HTTP 200)"
        ;;
    502)
        log_error "DETECTED: 502 Bad Gateway - Backend is not responding"
        log_info "Check PM2 logs: pm2 logs $PM2_APP_NAME"
        ;;
    000)
        log_error "Cannot reach API endpoint (Connection failed)"
        ;;
    *)
        log_warning "API endpoint returned HTTP $API_STATUS (may be expected for auth routes)"
        ;;
esac

# ============================================
# FINAL STATUS
# ============================================

echo ""
echo "========================================"
echo "  DEPLOYMENT SUMMARY"
echo "========================================"
echo ""

# Show PM2 status
pm2 list

echo ""

# Report status
if [ "$HEALTH_OK" = true ] && [ ${#ERRORS[@]} -eq 0 ]; then
    log_success "DEPLOYMENT SUCCESSFUL"
    echo ""
    log_info "Health endpoint: $HEALTH_ENDPOINT"
    log_info "PM2 status: pm2 status"
    log_info "Logs: pm2 logs $PM2_APP_NAME"
    log_info "Backend logs: tail -f $BACKEND_DIR/logs/error.log"
    exit 0
elif [ "$HEALTH_OK" = true ]; then
    log_warning "DEPLOYED WITH WARNINGS"
    echo ""
    for error in "${ERRORS[@]}"; do
        log_error "$error"
    done
    exit 0
else
    log_error "DEPLOYMENT FAILED - Health check did not pass"
    echo ""
    log_info "Troubleshooting steps:"
    log_info "1. Check PM2 logs: pm2 logs $PM2_APP_NAME"
    log_info "2. Check error logs: tail -f $BACKEND_DIR/logs/error.log"
    log_info "3. Check .env configuration"
    log_info "4. Verify database connection: npx prisma db pull"
    log_info "5. Test locally: npm run dev"
    exit 1
fi
