#!/bin/bash
# Startup script for Azure App Service (Linux) - UI

echo "🎨 Starting UI application..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install --production
fi

# Start the server
echo "🚀 Starting Express server..."
node server.js
