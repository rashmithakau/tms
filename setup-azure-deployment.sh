#!/bin/bash
# Setup script for Azure deployment configuration

set -e

echo "🚀 Setting up Azure deployment configuration..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Please run 'git init' first."
    exit 1
fi

# Make scripts executable
echo "📝 Making deployment scripts executable..."
chmod +x deploy.sh
chmod +x deploy-ui.sh
chmod +x apps/api/startup.sh
chmod +x apps/ui/startup.sh

# Check if files exist
echo "✅ Checking configuration files..."
files=(
    ".deployment"
    "deploy.sh"
    "deploy-ui.sh"
    "apps/api/web.config"
    "apps/api/startup.sh"
    "apps/ui/server.js"
    "apps/ui/package.json"
    "apps/ui/web.config"
    "apps/ui/startup.sh"
    ".env.production.example"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (missing)"
    fi
done

echo ""
echo "🎯 Next steps:"
echo ""
echo "1. Review and update configuration files if needed"
echo "2. Commit changes:"
echo "   git add ."
echo "   git commit -m 'Add Azure Web App deployment configuration'"
echo "   git push origin main"
echo ""
echo "3. Create two Web Apps in Azure Portal:"
echo "   - API Web App: tms-api-yourname"
echo "   - UI Web App: tms-ui-yourname"
echo ""
echo "4. Follow the complete guide in AZURE_DEPLOYMENT_GUIDE.md"
echo ""
echo "✨ Setup complete!"
