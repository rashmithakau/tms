#!/bin/bash
# Startup script for Azure App Service (Linux)

echo "🚀 Starting TMS API..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Start the application
echo "✅ Starting Node.js application..."
node main.js
