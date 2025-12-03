#!/bin/bash
# Azure Deployment Script for Combined TMS (API + UI)

set -e

echo "🚀 Starting combined deployment..."
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --legacy-peer-deps || npm ci

# Build API
echo "🔨 Building API..."
npm run build:api

# Build UI
echo "🎨 Building UI..."
npm run build:ui

# Copy UI build to API dist directory
echo "📋 Copying UI files to API dist..."
mkdir -p dist/apps/api/../ui
cp -r dist/apps/ui/* dist/apps/api/../ui/

# Copy necessary files to dist
echo "📋 Copying configuration files..."
cp package.json dist/apps/api/
cp package-lock.json dist/apps/api/

# Install production dependencies in dist folder
echo "📥 Installing production dependencies..."
cd dist/apps/api
npm ci --production --legacy-peer-deps || npm ci --production
cd ../../..

echo "✅ Combined deployment complete!"
echo "📁 API build output: dist/apps/api"
echo "📁 UI build output: dist/apps/api/../ui"

# List contents for debugging
echo "📂 Build directory contents:"
ls -la dist/apps/api/
echo "📂 UI directory contents:"
ls -la dist/apps/api/../ui/ || echo "UI directory not found"
