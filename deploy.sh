#!/bin/bash
# Azure Deployment Script for TMS API

echo "🚀 Starting Azure deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the API project
echo "🔨 Building API..."
npm run build:api

# Create output directory if it doesn't exist
mkdir -p $DEPLOYMENT_TARGET

# Copy built files to deployment target
echo "📋 Copying files to deployment target..."
cp -r dist/apps/api/* $DEPLOYMENT_TARGET/
cp package.json $DEPLOYMENT_TARGET/
cp package-lock.json $DEPLOYMENT_TARGET/

echo "✅ Deployment complete!"
