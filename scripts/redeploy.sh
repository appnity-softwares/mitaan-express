#!/bin/bash

# Mitaan Express - Redeployment Script
# Optimized for Performance and PM2 process management.
# STRICT NO DOCKER POLICY | USES --legacy-peer-deps

set -e

# Path awareness: Move to project root
cd "$(dirname "$0")/.."

echo "🔄 Starting Redeployment..."

# 1. Pull latest code
git fetch origin main
git reset --hard origin/main

# 2. Build Backend
echo "📦 Updating Backend..."
cd backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy || echo "No migrations to apply"
cd ..

# 3. Build Frontend
echo "📦 Updating Frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# 4. Reload processes
echo "🔄 Reloading Application via PM2..."
pm2 reload mitaan-api --update-env || pm2 start ecosystem.config.js --env production

echo "✅ Redeployment Complete!"
