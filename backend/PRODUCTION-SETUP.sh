#!/bin/bash

# ============================================
# MITAAN EXPRESS - COMPLETE PRODUCTION SETUP
# Run this script on your VPS to deploy the entire project
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mitaan-express"
PROJECT_DIR="/var/www/$PROJECT_NAME"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
API_DOMAIN="api.mitaanexpress.com"
FRONTEND_DOMAIN="mitaanexpress.com"
PM2_APP_NAME="mitaan-api"

# System requirements
NODE_VERSION="20"
POSTGRES_VERSION="14"

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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check system requirements
check_system() {
    log_step "Checking system requirements..."
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_warning "This script is optimized for Ubuntu. Other distributions may require manual adjustments."
    fi
    
    # Check available disk space
    DISK_AVAILABLE=$(df / | awk 'NR==2 {print $4}')
    DISK_GB=$((DISK_AVAILABLE / 1024 / 1024))
    if [ $DISK_GB -lt 5 ]; then
        log_error "Insufficient disk space. At least 5GB required, available: ${DISK_GB}GB"
        exit 1
    fi
    
    # Check memory
    MEM_AVAILABLE=$(free -m | awk 'NR==2{print $7}')
    if [ $MEM_AVAILABLE -lt 1024 ]; then
        log_warning "Low memory available: ${MEM_AVAILABLE}MB. At least 1GB recommended."
    fi
    
    log_success "System requirements met"
}

# Update system packages
update_system() {
    log_step "Updating system packages..."
    apt update && apt upgrade -y
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    log_success "System updated"
}

# Install Node.js
install_nodejs() {
    log_step "Installing Node.js $NODE_VERSION..."
    
    # Remove old Node.js
    apt remove -y nodejs npm 2>/dev/null || true
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    # Verify installation
    NODE_VER=$(node --version)
    NPM_VER=$(npm --version)
    log_success "Node.js $NODE_VER and npm $NPM_VER installed"
}

# Install PostgreSQL
install_postgresql() {
    log_step "Installing PostgreSQL $POSTGRES_VERSION..."
    
    # Install PostgreSQL
    apt install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Verify installation
    PG_VER=$(pg_config --version)
    log_success "PostgreSQL $PG_VER installed"
}

# Install PM2 globally
install_pm2() {
    log_step "Installing PM2..."
    npm install -g pm2
    
    # Verify installation
    PM2_VER=$(pm2 --version)
    log_success "PM2 $PM2_VER installed"
}

# Install NGINX
install_nginx() {
    log_step "Installing NGINX..."
    apt install -y nginx
    
    # Start and enable NGINX
    systemctl start nginx
    systemctl enable nginx
    
    # Verify installation
    NGINX_VER=$(nginx -v 2>&1)
    log_success "NGINX installed"
}

# Setup project directory
setup_project_directory() {
    log_step "Setting up project directory..."
    
    # Create project directory
    mkdir -p "$PROJECT_DIR"
    
    # Create user for project (optional but recommended)
    if ! id "mitaan" &>/dev/null; then
        useradd -m -s /bin/bash mitaan
        log_info "Created user: mitaan"
    fi
    
    # Set permissions
    chown -R mitaan:mitaan "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    log_success "Project directory created at $PROJECT_DIR"
}

# Clone or update repository
setup_repository() {
    log_step "Setting up repository..."
    
    # Check if repository already exists
    if [ -d "$PROJECT_DIR/.git" ]; then
        log_info "Repository exists, updating..."
        cd "$PROJECT_DIR"
        sudo -u mitaan git pull origin main
    else
        log_info "Cloning repository..."
        # You need to replace this with your actual repository URL
        read -p "Enter your Git repository URL: " REPO_URL
        sudo -u mitaan git clone "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        sudo -u mitaan git checkout main
    fi
    
    log_success "Repository setup completed"
}

# Setup database
setup_database() {
    log_step "Setting up PostgreSQL database..."
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE $PROJECT_NAME;
CREATE USER ${PROJECT_NAME}_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE $PROJECT_NAME TO ${PROJECT_NAME}_user;
ALTER USER ${PROJECT_NAME}_user CREATEDB;
EOF
    
    log_success "Database and user created"
    log_warning "Please update the DATABASE_URL in .env file with:"
    log_info "postgresql://${PROJECT_NAME}_user:your_secure_password_here@localhost:5432/$PROJECT_NAME"
}

# Setup environment file
setup_environment() {
    log_step "Setting up environment configuration..."
    
    cd "$BACKEND_DIR"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            sudo -u mitaan cp .env.example .env
        else
            # Create basic .env file
            sudo -u mitaan cat > .env << EOF
# Database
DATABASE_URL="postgresql://${PROJECT_NAME}_user:your_secure_password_here@localhost:5432/$PROJECT_NAME"

# JWT
JWT_SECRET="your-256-bit-secret-change-this-in-production"

# URLs
FRONTEND_URL="https://$FRONTEND_DOMAIN"
API_URL="https://$API_DOMAIN"

# Environment
NODE_ENV="production"
PORT=3000

# R2 Storage (if using Cloudflare R2)
# R2_ACCOUNT_URL="your-r2-account-url"
# R2_ACCESS_KEY_ID="your-access-key"
# R2_SECRET_ACCESS_KEY="your-secret-key"
# R2_BUCKET_NAME="your-bucket-name"
EOF
        fi
        
        log_warning "Please edit $BACKEND_DIR/.env and update all configuration values"
        log_info " especially DATABASE_URL, JWT_SECRET, and R2 settings"
    fi
    
    log_success "Environment file created"
}

# Install backend dependencies
install_backend_dependencies() {
    log_step "Installing backend dependencies..."
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    sudo -u mitaan npm ci --production
    
    # Generate Prisma client
    sudo -u mitaan npx prisma generate
    
    log_success "Backend dependencies installed"
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."
    
    cd "$BACKEND_DIR"
    
    # Run migrations
    sudo -u mitaan npx prisma migrate deploy
    
    # Verify database connection
    if sudo -u mitaan npx prisma db pull > /dev/null 2>&1; then
        log_success "Database migrations completed successfully"
    else
        log_warning "Database migration completed with warnings"
    fi
}

# Build frontend
build_frontend() {
    log_step "Building frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    sudo -u mitaan npm ci
    
    # Build for production
    sudo -u mitaan npm run build
    
    log_success "Frontend built successfully"
}

# Setup PM2
setup_pm2() {
    log_step "Setting up PM2..."
    
    cd "$BACKEND_DIR"
    
    # Start application with PM2
    sudo -u mitaan pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    sudo -u mitaan pm2 save
    
    # Setup PM2 startup script
    sudo -u mitaan pm2 startup systemd -u mitaan --hp /home/mitaan
    
    log_success "PM2 setup completed"
}

# Setup SSL certificates
setup_ssl() {
    log_step "Setting up SSL certificates..."
    
    # Install Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificates
    certbot --nginx -d "$API_DOMAIN" -d "$FRONTEND_DOMAIN" --non-interactive --agree-tos --email admin@$FRONTEND_DOMAIN
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log_success "SSL certificates installed and auto-renewal configured"
}

# Setup NGINX configuration
setup_nginx() {
    log_step "Setting up NGINX configuration..."
    
    # Copy NGINX configuration
    cp "$BACKEND_DIR/nginx-production.conf" "/etc/nginx/sites-available/$PROJECT_NAME"
    
    # Enable site
    ln -sf "/etc/nginx/sites-available/$PROJECT_NAME" "/etc/nginx/sites-enabled/"
    
    # Remove default site
    rm -f "/etc/nginx/sites-enabled/default"
    
    # Test configuration
    nginx -t
    
    # Reload NGINX
    systemctl reload nginx
    
    log_success "NGINX configuration updated"
}

# Setup firewall
setup_firewall() {
    log_step "Setting up firewall..."
    
    # Enable UFW
    ufw --force enable
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 'Nginx Full'
    
    log_success "Firewall configured"
}

# Setup log rotation
setup_log_rotation() {
    log_step "Setting up log rotation..."
    
    # Create logrotate configuration for PM2
    cat > "/etc/logrotate.d/$PROJECT_NAME" << EOF
$BACKEND_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 mitaan mitaan
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    # Create logrotate configuration for NGINX
    cat > "/etc/logrotate.d/$PROJECT_NAME-nginx" << EOF
/var/log/nginx/$PROJECT_NAME*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF
    
    log_success "Log rotation configured"
}

# Setup monitoring
setup_monitoring() {
    log_step "Setting up monitoring..."
    
    # Create health check script
    cat > "/usr/local/bin/$PROJECT_NAME-health-check.sh" << EOF
#!/bin/bash
HEALTH_URL="https://$API_DOMAIN/health"
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
    
    # Add to crontab (every 5 minutes)
    echo "*/5 * * * * /usr/local/bin/$PROJECT_NAME-health-check.sh" | crontab -
    
    log_success "Monitoring configured"
}

# Setup backup script
setup_backup() {
    log_step "Setting up backup script..."
    
    # Create backup directory
    mkdir -p "/var/backups/$PROJECT_NAME"
    
    # Create backup script
    cat > "/usr/local/bin/$PROJECT_NAME-backup.sh" << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/$PROJECT_NAME"
DATE=\$(date +%Y%m%d-%H%M%S)

# Database backup
pg_dump $PROJECT_NAME | gzip > "\$BACKUP_DIR/database-\$DATE.sql.gz"

# Code backup
tar -czf "\$BACKUP_DIR/code-\$DATE.tar.gz" -C /var/www $PROJECT_NAME

# Keep last 7 days
find "\$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "\$(date): Backup completed" >> "/var/log/$PROJECT_NAME-backup.log"
EOF
    
    chmod +x "/usr/local/bin/$PROJECT_NAME-backup.sh"
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/$PROJECT_NAME-backup.sh") | crontab -
    
    log_success "Backup script configured"
}

# Final verification
verify_setup() {
    log_step "Verifying setup..."
    
    # Check PM2 status
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        log_success "PM2 process is running"
    else
        log_error "PM2 process is not running"
        return 1
    fi
    
    # Check health endpoint
    sleep 5
    if curl -f "http://localhost:3000/health" > /dev/null 2>&1; then
        log_success "Health endpoint is responding"
    else
        log_warning "Health endpoint is not responding (may need more time)"
    fi
    
    # Check NGINX
    if nginx -t > /dev/null 2>&1; then
        log_success "NGINX configuration is valid"
    else
        log_error "NGINX configuration has errors"
        return 1
    fi
    
    # Check database connection
    cd "$BACKEND_DIR"
    if sudo -u mitaan npx prisma db pull > /dev/null 2>&1; then
        log_success "Database connection is working"
    else
        log_warning "Database connection may have issues"
    fi
    
    log_success "Setup verification completed"
}

# Print final information
print_final_info() {
    echo ""
    echo "========================================"
    echo "  SETUP COMPLETED SUCCESSFULLY"
    echo "========================================"
    echo ""
    echo "Project Directory: $PROJECT_DIR"
    echo "Backend URL: https://$API_DOMAIN"
    echo "Frontend URL: https://$FRONTEND_DOMAIN"
    echo "Health Endpoint: https://$API_DOMAIN/health"
    echo ""
    echo "Important Commands:"
    echo "  PM2 Status:     pm2 status"
    echo "  PM2 Logs:       pm2 logs $PM2_APP_NAME"
    echo "  Restart:        pm2 restart $PM2_APP_NAME"
    echo "  NGINX Reload:   sudo systemctl reload nginx"
    echo "  Health Check:   curl https://$API_DOMAIN/health"
    echo ""
    echo "Configuration Files:"
    echo "  Environment:    $BACKEND_DIR/.env"
    echo "  PM2 Config:     $BACKEND_DIR/ecosystem.config.js"
    echo "  NGINX Config:   /etc/nginx/sites-available/$PROJECT_NAME"
    echo ""
    echo "Logs:"
    echo "  Backend Logs:   $BACKEND_DIR/logs/"
    echo "  NGINX Logs:     /var/log/nginx/"
    echo "  Health Monitor: /var/log/$PROJECT_NAME-health.log"
    echo ""
    echo "Next Steps:"
    echo "  1. Edit $BACKEND_DIR/.env with your actual values"
    echo "  2. Update your DNS records to point to this server"
    echo "  3. Test the application by visiting the URLs above"
    echo "  4. Set up additional monitoring as needed"
    echo ""
    echo "Backup Location: /var/backups/$PROJECT_NAME"
    echo "Backup Script:   /usr/local/bin/$PROJECT_NAME-backup.sh"
    echo "Health Monitor:  /usr/local/bin/$PROJECT_NAME-health-check.sh"
    echo ""
}

# Main execution
main() {
    echo "========================================"
    echo "  MITAAN EXPRESS PRODUCTION SETUP"
    echo "========================================"
    echo ""
    echo "This script will set up the complete production environment"
    echo "including Node.js, PostgreSQL, PM2, NGINX, SSL, and monitoring."
    echo ""
    echo "Project will be installed to: $PROJECT_DIR"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled"
        exit 0
    fi
    
    # Execute all setup steps
    check_root
    check_system
    update_system
    install_nodejs
    install_postgresql
    install_pm2
    install_nginx
    setup_project_directory
    setup_repository
    setup_database
    setup_environment
    install_backend_dependencies
    run_migrations
    build_frontend
    setup_pm2
    setup_ssl
    setup_nginx
    setup_firewall
    setup_log_rotation
    setup_monitoring
    setup_backup
    verify_setup
    print_final_info
    
    log_success "Production setup completed successfully!"
}

# Run main function
main "$@"
