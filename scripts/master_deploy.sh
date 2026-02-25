#!/bin/bash

# Mitaan Express - Master Deployment Script for Hostinger KVM Ubuntu VPS
# This script performs initial environment setup, database configuration, and application build.

set -e

echo "🚀 Starting Master Deployment Setup..."

# 1. Update and Install System Dependencies
echo "📦 Installing system dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl build-essential postgresql postgresql-contrib redis-server

# 2. Install Node.js (v20)
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PM2 globally
sudo npm install -g pm2

# 3. Setup PostgreSQL
echo "🐘 Configuring PostgreSQL..."
DB_NAME="mitaanexpress"
DB_USER="mitaan_admin"
DB_PASS=$(openssl rand -base64 12)

sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# 4. Generate Production .env files
echo "📝 Generating environment files..."

# Backend .env
cat <<EOF > backend/.env
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?sslmode=disable"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=3000

# Cloudflare R2 Credentials (Placeholders)
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="your_bucket_name"
R2_ACCOUNT_URL="your_account_url"
EOF

# Frontend .env
cat <<EOF > frontend/.env
VITE_API_URL="https://www.mitaanexpress.com/api"
GEMINI_API_KEY="your_gemini_key"
EOF

echo "✅ Environment files created."

# 5. Build Application
echo "🏗️ Building Backend..."
cd backend
npm install
npx prisma generate
npx prisma migrate deploy || echo "No migrations to apply yet"
cd ..

echo "🏗️ Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 6. Service Setup
echo "⚙️ Setting up Systemd Service..."
sudo cp scripts/mitaan-express-backend.service /etc/systemd/system/mitaan-express-backend.service
sudo systemctl daemon-reload
sudo systemctl enable mitaan-express-backend
sudo systemctl start mitaan-express-backend

# 7. Nginx Setup
echo "🌐 Configuring Nginx..."
sudo cp scripts/nginx.conf /etc/nginx/sites-available/mitaanexpress
sudo ln -sf /etc/nginx/sites-available/mitaanexpress /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "🏁 Master Setup Complete!"
echo "--------------------------------------------------"
echo "Database Password: $DB_PASS"
echo "Please save this password securely."
echo "--------------------------------------------------"
echo "Next: Setup SSL with Certbot"
