#!/bin/bash
# Azure Deployment Script for TMS API

set -e

echo "🚀 Starting API deployment..."
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --legacy-peer-deps || npm ci

# Build API
echo "🔨 Building API..."
npm run build:api

# Copy necessary files to dist
echo "📋 Copying configuration files..."
cp package.json dist/apps/api/
cp package-lock.json dist/apps/api/

# Install production dependencies in dist folder
echo "📥 Installing production dependencies..."
cd dist/apps/api
npm ci --production --legacy-peer-deps || npm ci --production
cd ../../..

echo "✅ API deployment complete!"
echo "📁 API build output: dist/apps/api"

# List contents for debugging
echo "📂 Build directory contents:"
ls -la dist/apps/api/
