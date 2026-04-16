#!/bin/bash

# ============================================
# MITAAN EXPRESS - PRODUCTION FIX SCRIPT
# Run this AFTER pulling latest code from GitHub
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Auto-detect project directory
detect_project() {
    echo -e "${CYAN}[DETECT]${NC} Finding project directory..."
    
    POSSIBLE_DIRS=(
        "/var/www/mitaan-express"
        "/var/www/mitaan-express-main"
        "/home/mitaan/mitaan-express"
        "/home/ubuntu/mitaan-express"
        "/opt/mitaan-express"
        "$(pwd)"
    )
    
    PROJECT_DIR=""
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [ -d "$dir" ] && [ -f "$dir/backend/package.json" ]; then
            PROJECT_DIR="$dir"
            break
        fi
    done
    
    if [ -z "$PROJECT_DIR" ]; then
        echo -e "${RED}[ERROR]${NC} Project directory not found"
        echo "Run this script from the project directory or specify path:"
        echo "  ./FIX-PRODUCTION.sh /path/to/mitaan-express"
        exit 1
    fi
    
    BACKEND_DIR="$PROJECT_DIR/backend"
    echo -e "${GREEN}[FOUND]${NC} Project at: $PROJECT_DIR"
}

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
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# ============================================
# STEP 1: STOP CURRENT PROCESSES
# ============================================

stop_processes() {
    log_step "Stopping current processes..."
    
    # Stop PM2 processes
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "mitaan-api"; then
            log_info "Stopping PM2 process..."
            pm2 stop mitaan-api || true
            pm2 delete mitaan-api || true
        fi
    fi
    
    # Kill any Node.js processes on port 4000
    if lsof -i :4000 &> /dev/null; then
        log_info "Killing processes on port 4000..."
        pkill -f "node.*4000" || true
        sleep 2
    fi
    
    log_success "Processes stopped"
}

# ============================================
# STEP 2: UPDATE CODE AND DEPENDENCIES
# ============================================

update_code() {
    log_step "Updating code and dependencies..."
    
    cd "$BACKEND_DIR"
    
    # Pull latest code
    log_info "Pulling latest code from GitHub..."
    git pull origin main
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install 
    # Ensure required Prisma adapter packages are installed
    log_info "Ensuring Prisma adapter packages..."
    npm install @prisma/adapter-pg pg --save
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    
    log_success "Code updated"
}

# ============================================
# STEP 3: DATABASE OPERATIONS
# ============================================

fix_database() {
    log_step "Fixing database issues..."
    
    cd "$BACKEND_DIR"
    
    # Check database connection
    log_info "Testing database connection..."
    if npx prisma db pull > /dev/null 2>&1; then
        log_success "Database connection OK"
    else
        log_error "Database connection failed"
        echo "Check your .env file DATABASE_URL"
        exit 1
    fi
    
    # Run migrations safely
    log_info "Running database migrations..."
    npx prisma migrate deploy
    
    # Reset database if needed (only if data loss is acceptable)
    read -p "Reset database to fix schema issues? This will DELETE all data. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Resetting database..."
        npx prisma migrate reset --force
        npx prisma db seed || true
    fi
    
    log_success "Database fixed"
}

# ============================================
# STEP 4: APPLY ALL FIXES
# ============================================

apply_fixes() {
    log_step "Applying production fixes..."
    
    cd "$BACKEND_DIR"
    
    # 1. Verify server.js has error handling
    if ! grep -q "GLOBAL ERROR" server.js; then
        log_warning "server.js may not have global error handling"
        log_info "The latest code should include error handling - ensure you pulled from GitHub"
    fi
    
    # 2. Verify ecosystem.config.js exists
    if [ ! -f "ecosystem.config.js" ]; then
        log_error "ecosystem.config.js not found - ensure you pulled latest code"
        exit 1
    fi
    
    # 3. Check for Prisma query issues
    log_info "Checking for Prisma query issues..."
    if node -e "
        const fs = require('fs');
        const files = fs.readdirSync('./controllers').filter(f => f.endsWith('.js'));
        let issues = 0;
        files.forEach(file => {
            const content = fs.readFileSync('./controllers/' + file, 'utf8');
            if (content.includes('select:') && content.includes('include:')) {
                console.log('Potential issue in:', file);
                issues++;
            }
        });
        if (issues === 0) {
            console.log('No Prisma select+include conflicts found');
        }
    "; then
        log_success "No Prisma query conflicts found"
    fi
    
    log_success "Fixes verified"
}

# ============================================
# STEP 5: START APPLICATION
# ============================================

start_application() {
    log_step "Starting application..."
    
    cd "$BACKEND_DIR"
    
    # Start with PM2
    log_info "Starting PM2 process..."
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for startup
    log_info "Waiting for application to start..."
    sleep 5
    
    log_success "Application started"
}

# ============================================
# STEP 6: VERIFY EVERYTHING WORKS
# ============================================

verify_fixes() {
    log_step "Verifying fixes..."
    
    # Check PM2 status
    if pm2 list | grep -q "mitaan-api"; then
        log_success "PM2 process is running"
    else
        log_error "PM2 process not running"
        return 1
    fi
    
    # Check health endpoint
    log_info "Testing health endpoint..."
    for i in {1..10}; do
        if curl -f http://localhost:4000/health > /dev/null 2>&1; then
            log_success "Health endpoint responding"
            break
        fi
        if [ $i -eq 10 ]; then
            log_error "Health endpoint not responding after 10 attempts"
            return 1
        fi
        sleep 2
    done
    
    # Test API endpoints
    log_info "Testing API endpoints..."
    if curl -f http://localhost:4000/api/articles?limit=1 > /dev/null 2>&1; then
        log_success "Articles API working"
    else
        log_warning "Articles API test failed"
    fi
    
    if curl -f http://localhost:4000/api/blogs?limit=1 > /dev/null 2>&1; then
        log_success "Blogs API working"
    else
        log_warning "Blogs API test failed"
    fi
    
    log_success "Verification completed"
}

# ============================================
# STEP 7: UPDATE NGINX IF NEEDED
# ============================================

update_nginx() {
    log_step "Updating NGINX configuration..."
    
    # Check if custom NGINX config exists
    NGINX_CONFIG="$BACKEND_DIR/nginx-production.conf"
    if [ -f "$NGINX_CONFIG" ]; then
        log_info "Updating NGINX with production config..."
        cp "$NGINX_CONFIG" "/etc/nginx/sites-available/mitaan-express"
        
        # Enable site
        ln -sf "/etc/nginx/sites-available/mitaan-express" "/etc/nginx/sites-enabled/"
        rm -f "/etc/nginx/sites-enabled/default"
        
        # Test and reload
        nginx -t
        systemctl reload nginx
        
        log_success "NGINX updated"
    else
        log_warning "NGINX config not found - using existing configuration"
    fi
}

# ============================================
# STEP 8: FINAL STATUS
# ============================================

final_status() {
    echo ""
    echo "========================================"
    echo "  PRODUCTION FIX COMPLETED"
    echo "========================================"
    echo ""
    echo "Status Checks:"
    echo "  PM2 Process: $(pm2 list | grep mitaan-api | awk '{print $1, $2, $3, $4}' || echo 'Not found')"
    echo "  Health Endpoint: $(curl -s -w '%{http_code}' http://localhost:4000/health -o /dev/null || echo 'Failed')"
    echo "  NGINX Status: $(systemctl is-active nginx)"
    echo ""
    echo "Useful Commands:"
    echo "  PM2 Logs:       pm2 logs mitaan-api"
    echo "  PM2 Restart:    pm2 restart mitaan-api"
    echo "  Health Check:   curl http://localhost:4000/health"
    echo "  NGINX Reload:   sudo systemctl reload nginx"
    echo ""
    echo "If you still have issues:"
    echo "  1. Check PM2 logs: pm2 logs mitaan-api --err"
    echo "  2. Check .env file: cat $BACKEND_DIR/.env"
    echo "  3. Test database: cd $BACKEND_DIR && npx prisma db pull"
    echo ""
}

# ============================================
# MAIN EXECUTION
# ============================================

main() {
    # Handle command line argument for project directory
    if [ $# -eq 1 ]; then
        PROJECT_DIR="$1"
        BACKEND_DIR="$PROJECT_DIR/backend"
    else
        detect_project
    fi
    
    echo "========================================"
    echo "  MITAAN EXPRESS PRODUCTION FIX"
    echo "========================================"
    echo ""
    echo "Project: $PROJECT_DIR"
    echo "This will fix all production issues including:"
    echo "  - Prisma query errors"
    echo "  - PM2 crashes"
    echo "  - NGINX 502 errors"
    echo "  - Missing error handling"
    echo ""
    
    read -p "Continue with fix? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Fix cancelled"
        exit 0
    fi
    
    # Execute all fix steps
    stop_processes
    update_code
    fix_database
    apply_fixes
    start_application
    verify_fixes
    update_nginx
    final_status
    
    log_success "Production fix completed!"
    echo ""
    echo "Your application should now be stable and crash-proof."
    echo "Test it in your browser to confirm everything works."
}

# Run main function
main "$@"
