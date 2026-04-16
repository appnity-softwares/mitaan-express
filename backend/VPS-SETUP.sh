#!/bin/bash

# ============================================
# MITAAN EXPRESS - VPS PRODUCTION SETUP/UPDATE
# Adapts to existing VPS structure
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Auto-detect project structure
detect_structure() {
    echo -e "${CYAN}[DETECT]${NC} Analyzing VPS structure..."
    
    # Find project directory
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
        echo -e "${RED}[ERROR]${NC} Could not find mitaan-express project directory"
        echo "Please run this script from the project directory or specify the path:"
        echo "  ./VPS-SETUP.sh /path/to/mitaan-express"
        exit 1
    fi
    
    BACKEND_DIR="$PROJECT_DIR/backend"
    FRONTEND_DIR="$PROJECT_DIR/frontend"
    
    echo -e "${GREEN}[FOUND]${NC} Project at: $PROJECT_DIR"
}

# Configuration (will be auto-detected and updated)
PROJECT_NAME="mitaan-express"
API_DOMAIN="api.mitaanexpress.com"
FRONTEND_DOMAIN="mitaanexpress.com"
PM2_APP_NAME="mitaan-api"

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

# Check system requirements
check_system() {
    log_step "Checking system requirements..."
    
    # Check if running as root for system changes
    if [ "$EUID" -ne 0 ]; then
        log_warning "Not running as root. Some operations may require sudo."
    fi
    
    # Check Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        log_error "This script supports Ubuntu/Debian systems with apt package manager."
        exit 1
    fi
    
    # Check available disk space
    DISK_AVAILABLE=$(df / | awk 'NR==2 {print $4}')
    DISK_GB=$((DISK_AVAILABLE / 1024 / 1024))
    if [ $DISK_GB -lt 2 ]; then
        log_error "Insufficient disk space. At least 2GB required, available: ${DISK_GB}GB"
        exit 1
    fi
    
    log_success "System requirements met"
}

# Check what's already installed
check_existing_installation() {
    log_step "Checking existing installation..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VER=$(node --version)
        echo -e "${GREEN}  Node.js: $NODE_VER${NC}"
    else
        echo -e "${RED}  Node.js: Not installed${NC}"
    fi
    
    # Check PM2
    if command -v pm2 &> /dev/null; then
        PM2_VER=$(pm2 --version)
        echo -e "${GREEN}  PM2: $PM2_VER${NC}"
    else
        echo -e "${RED}  PM2: Not installed${NC}"
    fi
    
    # Check NGINX
    if command -v nginx &> /dev/null; then
        NGINX_VER=$(nginx -v 2>&1)
        echo -e "${GREEN}  NGINX: $NGINX_VER${NC}"
    else
        echo -e "${RED}  NGINX: Not installed${NC}"
    fi
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        PG_VER=$(pg_config --version 2>/dev/null || echo "PostgreSQL installed")
        echo -e "${GREEN}  PostgreSQL: $PG_VER${NC}"
    else
        echo -e "${RED}  PostgreSQL: Not installed${NC}"
    fi
    
    # Check PM2 processes
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "$PM2_APP_NAME"; then
            echo -e "${GREEN}  PM2 Process: $PM2_APP_NAME is running${NC}"
        else
            echo -e "${YELLOW}  PM2 Process: $PM2_APP_NAME not found${NC}"
        fi
    fi
    
    # Check if backend code exists
    if [ -f "$BACKEND_DIR/package.json" ]; then
        echo -e "${GREEN}  Backend Code: Found${NC}"
    else
        echo -e "${RED}  Backend Code: Not found${NC}"
    fi
    
    # Check if frontend code exists
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        echo -e "${GREEN}  Frontend Code: Found${NC}"
    else
        echo -e "${YELLOW}  Frontend Code: Not found${NC}"
    fi
}

# Install missing system packages
install_system_packages() {
    log_step "Installing missing system packages..."
    
    # Update package list
    apt update
    
    # Install basic packages
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-rate-limiting
    
    # Install Node.js if missing
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
        log_success "Node.js installed"
    fi
    
    # Install PM2 if missing
    if ! command -v pm2 &> /dev/null; then
        log_info "Installing PM2..."
        npm install -g pm2
        log_success "PM2 installed"
    fi
    
    # Install NGINX if missing
    if ! command -v nginx &> /dev/null; then
        log_info "Installing NGINX..."
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
        log_success "NGINX installed"
    fi
    
    # Install PostgreSQL if missing
    if ! command -v psql &> /dev/null; then
        log_info "Installing PostgreSQL..."
        apt install -y postgresql postgresql-contrib
        systemctl start postgresql
        systemctl enable postgresql
        log_success "PostgreSQL installed"
    fi
}

# Setup database (only if needed)
setup_database() {
    log_step "Setting up database..."
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$PROJECT_NAME"; then
        log_success "Database '$PROJECT_NAME' already exists"
        return
    fi
    
    # Create database and user
    log_info "Creating database and user..."
    sudo -u postgres psql << EOF
CREATE DATABASE $PROJECT_NAME;
CREATE USER ${PROJECT_NAME}_user WITH PASSWORD 'mitaan_db_password_2024';
GRANT ALL PRIVILEGES ON DATABASE $PROJECT_NAME TO ${PROJECT_NAME}_user;
ALTER USER ${PROJECT_NAME}_user CREATEDB;
EOF
    
    log_success "Database created"
    log_warning "Database password: mitaan_db_password_2024"
    log_info "Update your .env file with:"
    echo "  DATABASE_URL=\"postgresql://${PROJECT_NAME}_user:mitaan_db_password_2024@localhost:5432/$PROJECT_NAME\""
}

# Setup environment file
setup_environment() {
    log_step "Setting up environment configuration..."
    
    cd "$BACKEND_DIR"
    
    # Create .env file if missing
    if [ ! -f ".env" ]; then
        log_info "Creating .env file..."
        
        if [ -f ".env.example" ]; then
            cp .env.example .env
        else
            cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://${PROJECT_NAME}_user:mitaan_db_password_2024@localhost:5432/$PROJECT_NAME"

# JWT Configuration
JWT_SECRET="your-256-bit-secret-change-this-in-production-$(date +%s)"

# URLs
FRONTEND_URL="https://$FRONTEND_DOMAIN"
API_URL="https://$API_DOMAIN"

# Environment
NODE_ENV="production"
PORT=3000

# R2 Storage (Cloudflare) - Optional
# R2_ACCOUNT_URL="your-r2-account-url"
# R2_ACCESS_KEY_ID="your-access-key"
# R2_SECRET_ACCESS_KEY="your-secret-key"
# R2_BUCKET_NAME="your-bucket-name"
EOF
        fi
        
        log_success "Environment file created"
        log_warning "Please edit $BACKEND_DIR/.env and update configuration values"
    else
        log_success "Environment file already exists"
    fi
}

# Install backend dependencies
install_backend() {
    log_step "Setting up backend..."
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    log_info "Running database migrations..."
    npx prisma migrate deploy
    
    log_success "Backend setup completed"
}

# Build frontend (if exists)
build_frontend() {
    if [ ! -d "$FRONTEND_DIR" ] || [ ! -f "$FRONTEND_DIR/package.json" ]; then
        log_warning "Frontend not found, skipping build"
        return
    fi
    
    log_step "Building frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    npm ci
    
    # Build
    npm run build
    
    log_success "Frontend built successfully"
}

# Setup PM2
setup_pm2() {
    log_step "Setting up PM2..."
    
    cd "$BACKEND_DIR"
    
    # Check if ecosystem config exists
    if [ ! -f "ecosystem.config.js" ]; then
        log_warning "ecosystem.config.js not found, using default PM2 start"
        pm2 start server.js --name "$PM2_APP_NAME" --env production
    else
        pm2 start ecosystem.config.js --env production
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    log_success "PM2 setup completed"
}

# Setup NGINX
setup_nginx() {
    log_step "Setting up NGINX..."
    
    # Check if custom NGINX config exists
    NGINX_CONFIG="$BACKEND_DIR/nginx-production.conf"
    if [ -f "$NGINX_CONFIG" ]; then
        log_info "Using custom NGINX configuration..."
        cp "$NGINX_CONFIG" "/etc/nginx/sites-available/$PROJECT_NAME"
    else
        # Create basic NGINX config
        log_info "Creating basic NGINX configuration..."
        cat > "/etc/nginx/sites-available/$PROJECT_NAME" << EOF
server {
    listen 443 ssl http2;
    server_name $API_DOMAIN;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/$API_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts to prevent 502
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Health endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
        access_log off;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $API_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOF
    fi
    
    # Enable site
    ln -sf "/etc/nginx/sites-available/$PROJECT_NAME" "/etc/nginx/sites-enabled/"
    rm -f "/etc/nginx/sites-enabled/default"
    
    # Test and reload
    nginx -t
    systemctl reload nginx
    
    log_success "NGINX setup completed"
}

# Setup SSL (Let's Encrypt)
setup_ssl() {
    log_step "Setting up SSL certificates..."
    
    # Install Certbot if not present
    if ! command -v certbot &> /dev/null; then
        apt install -y certbot python3-certbot-nginx
    fi
    
    # Get SSL certificate
    certbot --nginx -d "$API_DOMAIN" -d "$FRONTEND_DOMAIN" --non-interactive --agree-tos --email admin@$FRONTEND_DOMAIN || true
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log_success "SSL setup completed"
}

# Setup firewall
setup_firewall() {
    log_step "Setting up firewall..."
    
    # Enable UFW if not already enabled
    ufw --force enable 2>/dev/null || true
    
    # Allow essential services
    ufw allow ssh 2>/dev/null || true
    ufw allow 'Nginx Full' 2>/dev/null || true
    
    log_success "Firewall configured"
}

# Setup monitoring
setup_monitoring() {
    log_step "Setting up monitoring..."
    
    # Create health check script
    cat > "/usr/local/bin/$PROJECT_NAME-health-check.sh" << EOF
#!/bin/bash
HEALTH_URL="http://localhost:3000/health"
LOG_FILE="/var/log/$PROJECT_NAME-health.log"

response=\$(curl -s -w "\%{http_code}" "\$HEALTH_URL" 2>/dev/null)
http_code=\${response: -3}

if [ "\$http_code" != "200" ] && [ "\$http_code" != "503" ]; then
    echo "\$(date): Health check failed (HTTP \$http_code)" >> "\$LOG_FILE"
    pm2 restart $PM2_APP_NAME
    echo "\$(date): PM2 restarted" >> "\$LOG_FILE"
fi
EOF
    
    chmod +x "/usr/local/bin/$PROJECT_NAME-health-check.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/$PROJECT_NAME-health-check.sh") | crontab -
    
    log_success "Monitoring setup completed"
}

# Verify installation
verify_installation() {
    log_step "Verifying installation..."
    
    # Check PM2
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        log_success "PM2 process is running"
    else
        log_error "PM2 process not found"
        return 1
    fi
    
    # Check health endpoint
    sleep 3
    if curl -f "http://localhost:3000/health" > /dev/null 2>&1; then
        log_success "Health endpoint responding"
    else
        log_warning "Health endpoint not responding (may need more time)"
    fi
    
    # Check NGINX
    if nginx -t > /dev/null 2>&1; then
        log_success "NGINX configuration valid"
    else
        log_error "NGINX configuration error"
        return 1
    fi
    
    log_success "Installation verified"
}

# Print final information
print_final_info() {
    echo ""
    echo "========================================"
    echo "  SETUP COMPLETED"
    echo "========================================"
    echo ""
    echo "Project Directory: $PROJECT_DIR"
    echo "Backend URL: https://$API_DOMAIN"
    echo "Health Endpoint: https://$API_DOMAIN/health"
    echo ""
    echo "Commands:"
    echo "  PM2 Status:     pm2 status"
    echo "  PM2 Logs:       pm2 logs $PM2_APP_NAME"
    echo "  Restart:        pm2 restart $PM2_APP_NAME"
    echo "  NGINX Reload:   sudo systemctl reload nginx"
    echo "  Health Check:   curl https://$API_DOMAIN/health"
    echo ""
    echo "Important Files:"
    echo "  Environment:    $BACKEND_DIR/.env"
    echo "  PM2 Config:     $BACKEND_DIR/ecosystem.config.js"
    echo "  NGINX Config:   /etc/nginx/sites-available/$PROJECT_NAME"
    echo ""
    echo "Next Steps:"
    echo "  1. Update DNS records to point to this server"
    echo "  2. Edit $BACKEND_DIR/.env with your actual values"
    echo "  3. Test the application"
    echo ""
}

# Main function
main() {
    # Handle command line argument for project directory
    if [ $# -eq 1 ]; then
        PROJECT_DIR="$1"
        BACKEND_DIR="$PROJECT_DIR/backend"
        FRONTEND_DIR="$PROJECT_DIR/frontend"
    else
        detect_structure
    fi
    
    echo "========================================"
    echo "  MITAAN EXPRESS VPS SETUP"
    echo "========================================"
    echo ""
    echo "Project Directory: $PROJECT_DIR"
    echo "This script will adapt to your existing VPS structure"
    echo ""
    
    read -p "Continue with setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled"
        exit 0
    fi
    
    # Execute setup steps
    check_system
    check_existing_installation
    install_system_packages
    setup_database
    setup_environment
    install_backend
    build_frontend
    setup_pm2
    setup_nginx
    setup_ssl
    setup_firewall
    setup_monitoring
    verify_installation
    print_final_info
    
    log_success "VPS setup completed!"
}

# Run main function with all arguments
main "$@"
