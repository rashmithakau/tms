#!/bin/bash
# Azure Deployment Script for TMS UI

set -e

echo "🎨 Starting UI deployment..."
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Install root dependencies
echo "📥 Installing dependencies..."
npm ci --legacy-peer-deps || npm ci

# Build UI
echo "🔨 Building UI..."
npm run build:ui

# Navigate to UI app directory
cd apps/ui

# Install UI server dependencies
echo "📥 Installing UI server dependencies..."
npm install --production

# Copy built files to current directory
echo "📋 Copying build files..."
mkdir -p dist
cp -r ../../dist/apps/ui/* ./dist/

echo "✅ UI deployment complete!"
echo "📂 UI files ready at: apps/ui/dist"

# List contents for debugging
echo "📂 Directory contents:"
ls -la
if [ -d "dist" ]; then
    echo "📂 Dist directory contents:"
    ls -la dist/
fi
