# Azure Deployment Guide for TMS Project

## ✅ Files Created

All necessary deployment files have been created:

- ✅ `.deployment` - Azure deployment configuration
- ✅ `deploy.sh` - Build and deployment script
- ✅ `.env.production.example` - Environment variables template
- ✅ `apps/api/web.config` - IIS configuration for Windows
- ✅ `apps/api/startup.sh` - Startup script for Linux
- ✅ `apps/ui/staticwebapp.config.json` - Static Web App configuration
- ✅ Updated `package.json` with build scripts and Node version
- ✅ Updated `apps/api/src/main.ts` with Azure-friendly port configuration and health check

## 🚀 Quick Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Azure deployment configuration"
git push origin main
```

### Step 2: Create Azure Web App (API)

1. Go to https://portal.azure.com
2. Click "Create a resource" → Search "Web App"
3. Fill in:
   - **Name:** `tms-api` (or your preferred name)
   - **Runtime:** Node 20 LTS
   - **OS:** Linux
   - **Plan:** Free F1 or Basic B1
4. Go to **Deployment Center** tab
5. Select **GitHub** → Authorize → Select repo: `tms` → Branch: `main`
6. Click **Save**

### Step 3: Configure API Environment Variables

Go to your Web App → **Configuration** → **Application settings** → Add:

```
NODE_ENV=production
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALLOWED_ORIGINS=https://your-ui-url.azurestaticapps.net
```

### Step 4: Create Static Web App (UI)

1. Azure Portal → "Create a resource" → Search "Static Web App"
2. Fill in:
   - **Name:** `tms-ui`
   - **Source:** GitHub
   - **Repository:** tms
   - **Branch:** main
   - **App location:** `/apps/ui`
   - **Output location:** `dist/apps/ui`
3. Click **Create**

### Step 5: Configure UI Environment Variables

Go to Static Web App → **Configuration** → Add:

```
VITE_API_URL=https://tms-api.azurewebsites.net
```

### Step 6: Setup MongoDB

**Option A - MongoDB Atlas (Free):**
1. Go to https://mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Allow access from anywhere
5. Get connection string

**Option B - Azure Cosmos DB:**
1. Create Azure Cosmos DB with MongoDB API
2. Get connection string from portal

### Step 7: Configure CORS

Go to API Web App → **CORS** → Add:
```
https://your-ui-url.azurestaticapps.net
```

## 🎉 That's It!

Your application will now:
- ✅ Auto-deploy when you push to GitHub
- ✅ Build automatically in Azure
- ✅ Run with proper environment configuration
- ✅ Scale automatically based on load

## 🔗 Access Your Apps

- **API:** https://tms-api.azurewebsites.net
- **UI:** https://tms-ui.azurestaticapps.net
- **Health Check:** https://tms-api.azurewebsites.net/health

## 💰 Estimated Costs

- **Free Tier:** $0/month (F1 + Free Static Web App + MongoDB Atlas M0)
- **Production:** ~$20-30/month (B1 + Standard Static Web App + Database)

## 📊 View Deployments

- **API Deployments:** Web App → Deployment Center
- **UI Deployments:** Static Web App → GitHub Action runs
- **Logs:** Web App → Log stream

## 🐛 Troubleshooting

### Build fails?
- Check logs in Deployment Center
- Verify all dependencies in package.json
- Ensure Node version matches (20.x)

### API shows error?
- Check Log stream for errors
- Verify environment variables are set
- Check MONGODB_URI is correct
- Restart the app

### Frontend can't connect?
- Verify CORS settings
- Check VITE_API_URL in Static Web App config
- Ensure API URL uses https://

## 📞 Need Help?

Check Azure documentation:
- App Service: https://docs.microsoft.com/azure/app-service/
- Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/
