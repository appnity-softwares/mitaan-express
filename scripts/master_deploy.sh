#!/bin/bash

# Mitaan Express - Master Deployment Script for KVM Ubuntu VPS
# Optimized for Performance, Security, and Ease of Use.
# STRICT NO DOCKER POLICY | USES --legacy-peer-deps

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Master Deployment Setup...${NC}"

# Path awareness: Move to project root
cd "$(dirname "$0")/.."

# 1. System Updates & Dependencies
echo -e "${GREEN}📦 Installing system dependencies...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl build-essential postgresql postgresql-contrib redis-server ufw

# 2. Node.js & Tooling Setup
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}🟢 Installing Node.js (v20 LTS)...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo -e "${GREEN}🛠️ Installing global utilities...${NC}"
sudo npm install -g pm2 yarn 

# 3. Security: Basic Firewall
echo -e "${GREEN}🛡️ Configuring Firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
# sudo ufw --force enable # Uncomment to enable firewall automatically

# 4. PostgreSQL Configuration
echo -e "${GREEN}🐘 Configuring PostgreSQL...${NC}"
DB_NAME="mitaanexpress"
DB_USER="mitaan_admin"
DB_PASS=$(openssl rand -hex 16)

sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" || echo "User already exists"
sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

# 5. Environment File Generation
echo -e "${GREEN}📝 Generating Production Environment Files...${NC}"

# Backend .env
cat <<EOF > backend/.env
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?sslmode=disable"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=4000
NODE_ENV=production

# Storage Config (Update with your actual credentials)
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="your_bucket_name"
R2_ACCOUNT_URL="https://your-custom-domain.com"
EOF

# Frontend .env
cat <<EOF > frontend/.env
VITE_API_URL="https://api.mitaanexpress.com"
GEMINI_API_KEY="your_gemini_key"
EOF

# 6. Build Phase
echo -e "${GREEN}🏗️ Building Backend...${NC}"
cd backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy || echo "No migrations to apply"
# npm run seed # Uncomment if you want to seed on first deploy
cd ..

echo -e "${GREEN}🏗️ Building Frontend...${NC}"
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# 7. Process Management (PM2)
echo -e "${GREEN}🔄 Starting Application via PM2...${NC}"
pm2 delete mitaan-backend || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -n 1 | bash # Set PM2 to start on boot

# 8. Nginx Configuration
echo -e "${GREEN}🌐 Configuring Nginx...${NC}"
sudo cp scripts/nginx.conf /etc/nginx/sites-available/mitaanexpress
sudo ln -sf /etc/nginx/sites-available/mitaanexpress /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo -e "${BLUE}🏁 Master Setup Complete!${NC}"
echo "--------------------------------------------------"
echo -e "${GREEN}Access Info:${NC}"
echo "Frontend: http://your-vps-ip (or your domain)"
echo "Backend API: http://your-vps-ip:4000 (proxied via Nginx)"
echo ""
echo -e "${RED}IMPORTANT:${NC}"
echo "1. Update frontend/.env with your actual API domain."
echo "2. Run './scripts/setup_ssl.sh' to enable HTTPS."
echo "3. Update R2 credentials in backend/.env if using Cloudflare storage."
echo "--------------------------------------------------"

