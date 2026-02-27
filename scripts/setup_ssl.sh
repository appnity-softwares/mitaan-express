#!/bin/bash

# Mitaan Express - SSL Setup Script (Certbot)
# This script installs Certbot and configures SSL for mitaanexpress.com and api.mitaanexpress.com

set -e

echo "🔒 Starting SSL Setup with Certbot..."

# 1. Install Certbot and Nginx plugin
echo "📦 Installing Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtain SSL Certificates
# We use --nginx to automatically configure the blocks
echo "🌐 Obtaining certificates for mitaanexpress.com and api.mitaanexpress.com..."
# Note: This will prompt for an email and agreement to TOS if run for the first time
sudo certbot --nginx -d mitaanexpress.com -d www.mitaanexpress.com -d api.mitaanexpress.com --non-interactive --agree-tos -m admin@appnity.com --redirect

# 3. Verify Auto-Renewal
echo "🔄 Verifying auto-renewal timer..."
sudo systemctl status certbot.timer | grep Active

echo "✅ SSL Setup Complete!"
echo "Your site should now be accessible via https://mitaanexpress.com"
echo "Certificates will renew automatically."
