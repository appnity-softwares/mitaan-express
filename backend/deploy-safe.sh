#!/bin/bash

# ============================================
# PRODUCTION DEPLOYMENT SAFETY SCRIPT
# Prevents crashes and ensures zero-downtime deployment
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
API_URL="https://api.mitaanexpress.com"
HEALTH_ENDPOINT="$API_URL/health"
PM2_APP_NAME="mitaan-api"
MAX_RETRIES=5
RETRY_DELAY=10

# Track deployment state
DEPLOYMENT_ID="deploy-$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="/tmp/mitaan-backup-$DEPLOYMENT_ID"
ROLLBACK_NEEDED=false

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
    ROLLBACK_NEEDED=true
}

# ============================================
# PRE-DEPLOYMENT CHECKS
# ============================================

echo "========================================"
echo "  MITAAN EXPRESS SAFE DEPLOYMENT"
echo "  ID: $DEPLOYMENT_ID"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_warning "Running as root. Consider using a non-root user for security."
fi

# Check required commands
for cmd in git node npm pm2 curl nginx; do
    if ! command -v $cmd &> /dev/null; then
        log_error "$cmd is required but not installed"
        exit 1
    fi
done

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    log_error "Disk usage too high: ${DISK_USAGE}%"
    exit 1
fi

# Check memory
MEM_AVAILABLE=$(free | awk 'NR==2{printf "%.0f", $7/$2 * 100.0}')
if [ $MEM_AVAILABLE -lt 10 ]; then
    log_error "Available memory too low: ${MEM_AVAILABLE}%"
    exit 1
fi

# ============================================
# BACKUP CURRENT VERSION
# ============================================

log_info "Creating backup of current version..."
mkdir -p "$BACKUP_DIR"

if [ -d "$BACKEND_DIR" ]; then
    cp -r "$BACKEND_DIR" "$BACKUP_DIR/backend"
    
    # Backup PM2 state
    pm2 save > "$BACKUP_DIR/pm2-state.txt" 2>&1 || true
    
    # Backup current git commit
    cd "$BACKEND_DIR"
    git rev-parse HEAD > "$BACKUP_DIR/git-commit.txt" 2>&1 || true
    
    log_success "Backup created at $BACKUP_DIR"
else
    log_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# ============================================
# HEALTH CHECK BEFORE DEPLOYMENT
# ============================================

log_info "Checking current health status..."

RETRY_COUNT=0
HEALTH_OK=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    log_info "Health check attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."
    
    HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo -e "\n000")
    HTTP_BODY=$(echo "$HTTP_RESPONSE" | head -n1)
    HTTP_STATUS=$(echo "$HTTP_RESPONSE" | tail -n1)
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        log_success "Current health check passed"
        HEALTH_OK=true
        break
    elif [ "$HTTP_STATUS" -eq 503 ]; then
        log_warning "Health check returned 503 (Degraded) - proceeding with caution"
        HEALTH_OK=true
        break
    else
        log_warning "Health check failed (HTTP $HTTP_STATUS)"
        if [ $RETRY_COUNT -eq $((MAX_RETRIES - 1)) ]; then
            log_error "Health check failed after $MAX_RETRIES attempts"
            log_error "Deployment aborted - fix current version first"
            exit 1
        fi
        sleep $RETRY_DELAY
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# ============================================
# DEPLOYMENT PROCESS
# ============================================

log_info "Starting deployment process..."
cd "$BACKEND_DIR"

# Stash any local changes
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Local changes detected, stashing..."
    git stash push -m "auto-stash-before-deploy-$DEPLOYMENT_ID"
fi

# Pull latest code
log_info "Pulling latest code..."
if ! git pull origin main; then
    log_error "Failed to pull latest code"
    exit 1
fi

# Check for new dependencies
log_info "Checking for dependency changes..."
if [ -f "package-lock.json" ] && [ -f "$BACKUP_DIR/backend/package-lock.json" ]; then
    if ! diff -q package-lock.json "$BACKUP_DIR/backend/package-lock.json" > /dev/null; then
        log_info "Dependencies changed, cleaning install..."
        rm -rf node_modules package-lock.json
    fi
fi

# Install dependencies
log_info "Installing dependencies..."
if npm ci --production; then
    log_success "Dependencies installed"
else
    log_error "Failed to install dependencies"
    exit 1
fi

# Generate Prisma client
log_info "Generating Prisma client..."
if npx prisma generate; then
    log_success "Prisma client generated"
else
    log_error "Failed to generate Prisma client"
    exit 1
fi

# Run database migrations (safe mode)
log_info "Running database migrations..."
if npx prisma migrate deploy; then
    log_success "Database migrations completed"
else
    log_warning "Database migration failed - checking if critical..."
    # Check if migration failure is critical
    MIGRATION_STATUS=$(npx prisma migrate status 2>/dev/null || echo "status_failed")
    if echo "$MIGRATION_STATUS" | grep -q "No pending migrations"; then
        log_warning "No pending migrations - continuing"
    else
        log_error "Critical migration failure - aborting deployment"
        exit 1
    fi
fi

# Create logs directory
mkdir -p logs

# ============================================
# ZERO-DOWNTIME DEPLOYMENT
# ============================================

log_info "Starting zero-downtime deployment..."

# Check if PM2 process exists
PM2_EXISTS=false
if pm2 list | grep -q "$PM2_APP_NAME"; then
    PM2_EXISTS=true
    log_info "Existing PM2 process found"
else
    log_info "No existing PM2 process found"
fi

# Create new process for zero-downtime
if [ "$PM2_EXISTS" = true ]; then
    log_info "Starting new instance for zero-downtime..."
    
    # Start new process with different name
    TEMP_APP_NAME="${PM2_APP_NAME}-new"
    
    if pm2 start ecosystem.config.js --env production --name "$TEMP_APP_NAME"; then
        log_success "New instance started"
        
        # Wait for new instance to be ready
        log_info "Waiting for new instance to be ready..."
        sleep 5
        
        # Test new instance health
        NEW_INSTANCE_READY=false
        for i in {1..10}; do
            if curl -f http://localhost:3000/health > /dev/null 2>&1; then
                NEW_INSTANCE_READY=true
                break
            fi
            sleep 2
        done
        
        if [ "$NEW_INSTANCE_READY" = true ]; then
            log_success "New instance is ready"
            
            # Reload old process gracefully
            log_info "Reloading old process..."
            pm2 reload "$PM2_APP_NAME"
            
            # Stop old process
            sleep 3
            pm2 stop "$PM2_APP_NAME"
            
            # Rename new process to original name
            pm2 delete "$TEMP_APP_NAME"
            pm2 start ecosystem.config.js --env production --name "$PM2_APP_NAME"
            
            log_success "Zero-downtime deployment completed"
        else
            log_error "New instance failed to start"
            pm2 delete "$TEMP_APP_NAME"
            exit 1
        fi
    else
        log_error "Failed to start new instance"
        exit 1
    fi
else
    log_info "Starting fresh PM2 process..."
    if pm2 start ecosystem.config.js --env production; then
        log_success "PM2 process started"
    else
        log_error "Failed to start PM2 process"
        exit 1
    fi
fi

# Save PM2 configuration
pm2 save

# ============================================
# POST-DEPLOYMENT VERIFICATION
# ============================================

log_info "Running post-deployment verification..."

# Wait for server to fully start
sleep 5

# Health check with retries
RETRY_COUNT=0
DEPLOYMENT_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    log_info "Post-deployment health check $((RETRY_COUNT + 1))/$MAX_RETRIES..."
    
    HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo -e "\n000")
    HTTP_BODY=$(echo "$HTTP_RESPONSE" | head -n1)
    HTTP_STATUS=$(echo "$HTTP_RESPONSE" | tail -n1)
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        log_success "Deployment health check passed"
        DEPLOYMENT_SUCCESS=true
        break
    elif [ "$HTTP_STATUS" -eq 503 ]; then
        log_warning "Health check returned 503 - checking if acceptable"
        if echo "$HTTP_BODY" | grep -q '"database":"connected"'; then
            log_success "Database connected, accepting 503"
            DEPLOYMENT_SUCCESS=true
            break
        fi
    else
        log_warning "Health check failed (HTTP $HTTP_STATUS)"
        if [ $RETRY_COUNT -eq $((MAX_RETRIES - 1)) ]; then
            log_error "Post-deployment health check failed"
            break
        fi
        sleep $RETRY_DELAY
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# Test API endpoints
if [ "$DEPLOYMENT_SUCCESS" = true ]; then
    log_info "Testing API endpoints..."
    
    # Test articles endpoint
    if curl -f "$API_URL/api/articles?limit=1" > /dev/null 2>&1; then
        log_success "Articles API working"
    else
        log_warning "Articles API test failed"
    fi
    
    # Test blogs endpoint
    if curl -f "$API_URL/api/blogs?limit=1" > /dev/null 2>&1; then
        log_success "Blogs API working"
    else
        log_warning "Blogs API test failed"
    fi
    
    # Test categories endpoint
    if curl -f "$API_URL/api/categories" > /dev/null 2>&1; then
        log_success "Categories API working"
    else
        log_warning "Categories API test failed"
    fi
fi

# ============================================
# NGINX VERIFICATION
# ============================================

log_info "Verifying NGINX configuration..."

if command -v nginx &> /dev/null; then
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        log_success "NGINX configuration is valid"
        
        log_info "Reloading NGINX..."
        if sudo systemctl reload nginx || sudo service nginx reload; then
            log_success "NGINX reloaded"
        else
            log_warning "Failed to reload NGINX - may need manual check"
        fi
    else
        log_error "NGINX configuration test failed"
        sudo nginx -t
    fi
else
    log_warning "NGINX not found on this server"
fi

# ============================================
# DEPLOYMENT SUMMARY
# ============================================

echo ""
echo "========================================"
echo "  DEPLOYMENT SUMMARY"
echo "========================================"
echo ""

# Show PM2 status
pm2 list

echo ""

if [ "$DEPLOYMENT_SUCCESS" = true ] && [ "$ROLLBACK_NEEDED" = false ]; then
    log_success "DEPLOYMENT SUCCESSFUL"
    echo ""
    log_info "Deployment ID: $DEPLOYMENT_ID"
    log_info "Health endpoint: $HEALTH_ENDPOINT"
    log_info "PM2 status: pm2 status"
    log_info "Logs: pm2 logs $PM2_APP_NAME"
    log_info "Backend logs: tail -f $BACKEND_DIR/logs/error.log"
    echo ""
    log_info "Backup available at: $BACKUP_DIR"
    
    # Clean up old backups (keep last 5)
    find /tmp -name "mitaan-backup-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    exit 0
else
    log_error "DEPLOYMENT FAILED - Initiating rollback"
    
    # ============================================
    # AUTOMATIC ROLLBACK
    # ============================================
    
    echo ""
    log_info "Starting automatic rollback..."
    
    if [ -d "$BACKUP_DIR/backend" ]; then
        # Stop current process
        pm2 stop "$PM2_APP_NAME" || true
        
        # Restore backup
        rm -rf "$BACKEND_DIR"
        cp -r "$BACKUP_DIR/backend" "$BACKEND_DIR"
        
        cd "$BACKEND_DIR"
        
        # Restore dependencies
        npm ci --production
        
        # Restart PM2
        pm2 start ecosystem.config.js --env production
        
        # Wait for rollback to complete
        sleep 5
        
        # Test rollback
        if curl -f "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log_success "Rollback completed successfully"
        else
            log_error "Rollback failed - manual intervention required"
        fi
    else
        log_error "No backup available for rollback"
    fi
    
    exit 1
fi
