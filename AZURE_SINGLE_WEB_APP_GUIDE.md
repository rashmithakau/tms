# 🚀 Deploy TMS to Single Azure Web App

Deploy both **UI (React)** and **API (Node.js)** in **ONE Azure Web App**.

---

## 📋 What You're Deploying

```
┌─────────────────────────────────────┐
│      Single Azure Web App           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Node.js Server (Port 8080)│   │
│  │                             │   │
│  │  ┌──────────┐  ┌─────────┐ │   │
│  │  │   API    │  │   UI    │ │   │
│  │  │  /api/*  │  │   /*    │ │   │
│  │  └──────────┘  └─────────┘ │   │
│  └─────────────────────────────┘   │
│             │                       │
│             ↓                       │
│      ┌─────────────┐                │
│      │  MongoDB    │                │
│      │  Atlas      │                │
│      └─────────────┘                │
└─────────────────────────────────────┘
```

**Your URL:** `https://tms-app-yourname.azurewebsites.net`
- UI: `https://tms-app-yourname.azurewebsites.net`
- API: `https://tms-app-yourname.azurewebsites.net/api`

---

## ✅ Changes Made

### **API Changes:**
✅ Serves static React files from `/dist/apps/ui`
✅ All API routes prefixed with `/api`
✅ React Router handled (all routes go to `index.html`)
✅ CORS simplified (same origin)

### **UI Changes:**
✅ API calls use relative path `/api` instead of full URL
✅ No separate UI server needed
✅ Built as static files served by Express

### **Deployment Changes:**
✅ Single `deploy.sh` builds both API and UI
✅ Copies UI build into API dist folder
✅ One Web App deployment instead of two

---

## 🚀 Quick Deploy (4 Steps)

### Step 1: Commit Your Code

```bash
git add .
git commit -m "Configure for single Azure Web App deployment"
git push origin master
```

### Step 2: Create MongoDB Database (FREE)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create **Free Cluster (M0)**
3. Choose **Azure** as provider
4. Create database user
5. Network Access: **Allow access from anywhere**
6. Get connection string:
   ```
   mongodb+srv://tmsuser:PASSWORD@cluster.mongodb.net/tms?retryWrites=true&w=majority
   ```

### Step 3: Create Azure Web App

**In Azure Portal:**
1. **Create a resource** → Search "Web App"
2. Fill in:
   - **Name**: `tms-app-yourname` (must be unique)
   - **Runtime**: Node 20 LTS
   - **OS**: Linux
   - **Pricing**: Free F1 or Basic B1
3. **Deployment** tab:
   - Enable **Continuous deployment** ✅
   - Connect to **GitHub**
   - Select repo: `tms`, branch: `master`
4. **Create**

### Step 4: Add Environment Variables

Go to: **Web App → Configuration → Application settings**

Add these:

```
NODE_ENV=production
PORT=8080
MONGODB_URI=[your-mongodb-connection-string]
JWT_SECRET=[generate-32-char-secret]
JWT_REFRESH_SECRET=[generate-32-char-secret]
SESSION_SECRET=[generate-32-char-secret]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=[your-gmail-app-password]
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads
LOG_LEVEL=info
ENABLE_LOGGING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Click **Save** → **Restart**

---

## ✅ Done!

**Test your deployment:**
- UI: `https://tms-app-yourname.azurewebsites.net`
- API health: `https://tms-app-yourname.azurewebsites.net/health`
- API endpoint example: `https://tms-app-yourname.azurewebsites.net/api/auth/login`

---

## 🔄 How It Works

### **Request Routing:**
```
User visits: https://tms-app-yourname.azurewebsites.net
    ↓
Express server receives request
    ↓
Is it /api/* ? 
    YES → API handles it (backend logic)
    NO  → Serve React index.html (frontend)
```

### **API Calls:**
```
React app calls: /api/auth/login
    ↓
Same origin (no CORS needed)
    ↓
Express handles /api/auth/login
    ↓
Returns JSON response
```

### **React Router:**
```
User navigates: /dashboard
    ↓
Not an API route
    ↓
Express serves index.html
    ↓
React Router handles /dashboard
```

---

## 🔄 Automatic Deployments

Every push to GitHub automatically updates your app:

```bash
git add .
git commit -m "Update feature"
git push origin master
# Wait 2-3 minutes - your app updates! ✨
```

**View deployment:**
- GitHub → **Actions** tab
- Azure Portal → Web App → **Deployment Center**

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. GitHub → **Actions** → View logs
2. Azure Portal → **Deployment Center** → Logs

**Common fixes:**
- Verify `deploy.sh` is correct
- Check `package.json` scripts
- Ensure Node version: `"node": "20.x"`

### API Not Working

**Check logs:**
1. Web App → **Log stream**

**Common issues:**
- Wrong `MONGODB_URI`
- Missing environment variables
- Port not set to 8080

**Fix:**
1. Verify all settings in **Configuration**
2. Click **Restart**

### UI Not Loading

**Check:**
1. Web App → **Log stream**
2. Verify build completed in GitHub Actions

**Common issues:**
- UI build failed
- Files not copied correctly
- Path issues in `main.ts`

**Fix:**
1. Check deployment logs
2. Verify `dist/apps/ui` exists after build
3. Restart app

### API Routes Not Working

**Symptom:**
- UI loads but API calls fail
- 404 errors on `/api/*` routes

**Fix:**
1. Verify all routes in `main.ts` have `/api` prefix
2. Check `apiClient.ts` uses `/api` as base URL
3. Restart app

---

## 💰 Cost

**Free Tier (Development):**
- Web App (F1): $0/month
- MongoDB Atlas (M0): $0/month
- **Total: $0/month**

**Production:**
- Web App (B1): $13/month
- MongoDB Atlas (M10): $57/month
- **Total: $70/month**

**Savings vs Two Web Apps:**
- ✅ Save $13/month (one less Web App)
- ✅ Simpler deployment
- ✅ No CORS configuration needed

---

## 📊 Deployment Summary

✅ **What you have:**

1. ✅ **Single Web App**: Hosts both UI and API
2. ✅ **MongoDB Atlas**: Free database
3. ✅ **GitHub Actions**: Auto-deploy on push
4. ✅ **No CORS issues**: Same origin
5. ✅ **Health check**: `/health` endpoint
6. ✅ **React Router**: Fully supported
7. ✅ **Environment variables**: Securely managed

**Automatic deployments:** ✨ Push to GitHub → Auto-deploy

---

## 🎯 API Route Prefixes

All API routes are now prefixed with `/api`:

| Old Route | New Route |
|-----------|-----------|
| `/auth/login` | `/api/auth/login` |
| `/api/user/me` | `/api/user/me` |
| `/api/project` | `/api/project` |
| `/api/timesheets` | `/api/timesheets` |
| `/api/team` | `/api/team` |
| `/api/notifications` | `/api/notifications` |
| `/api/reports` | `/api/reports` |
| `/api/dashboard` | `/api/dashboard` |
| `/api/history` | `/api/history` |

---

## 📁 File Structure After Build

```
dist/apps/api/
├── main.js              # Express server (serves API + UI)
├── config/
├── controllers/
├── routes/
├── ...
├── ui/                  # React build (copied here)
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── ...
└── package.json
```

---

## 🎉 Success!

Your application is now:
- ✅ Deployed to single Azure Web App
- ✅ Auto-deploying from GitHub
- ✅ Running on free tier (or affordable basic)
- ✅ No CORS configuration needed
- ✅ Simpler architecture
- ✅ Production-ready

**Happy deploying! 🚀**

---

## 📞 Need Help?

1. Check logs in Azure Portal → Log stream
2. Review GitHub Actions for build errors
3. Test locally: `npm run build && npm start`
4. Verify all environment variables are set

**Last Updated**: December 2024
