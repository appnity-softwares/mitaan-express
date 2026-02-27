#!/bin/bash

# Mitaan Express - Redeployment Script
# Pulled by CI/CD or manually run on VPS

set -e

# Path awareness: Move to project root
cd "$(dirname "$0")/.."

echo "🔄 Starting Redeployment..."

# 1. Pull latest code
git fetch origin main
git reset --hard origin/main

# 2. Update Backend
echo "📦 Updating Backend..."
cd backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
sudo systemctl restart mitaan-express-backend
cd ..

# 3. Update Frontend
echo "📦 Updating Frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

echo "✅ Redeployment Complete!"
