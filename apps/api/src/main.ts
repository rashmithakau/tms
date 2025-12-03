import express from 'express';
import http from 'http';
import path from 'path';
import { existsSync, readdirSync } from 'fs';
import connectDB from './config/db';
import { APP_ORIGIN, NODE_ENV, PORT } from './constants/env';
import cors from 'cors';
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth.route";
import userRoutes from './routes/user.route';
import projectRoutes from './routes/project.route';
import timesheetRoutes from './routes/timesheet.route';
import notificationRoutes from './routes/notification.route';
import teamRoutes from './routes/team.route';
import reportRoutes from './routes/report.route';
import dashboardRoutes from './routes/dashboard.route';
import historyRoutes from './routes/history.route';
import { socketService } from './config/socket';
import { CronJobService } from './services/cronJob.service';

// Use PORT from environment (Azure sets this) or fallback to 5000
const port = Number(process.env.PORT || PORT || 8080);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS - allow same origin since UI and API are together
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(cookieParser());

// Serve static files from UI build (React app)
// In Azure: __dirname is /home/site/wwwroot/apps/api/src
// UI folder is at /home/site/wwwroot/ui (3 levels up)
const uiBuildPath = path.join(__dirname, '..', '..', '..', 'ui');

console.log('📂 Application directory:', __dirname);
console.log('🔍 Looking for UI at:', uiBuildPath);
console.log('📁 Files in app directory:', readdirSync(__dirname));

if (existsSync(uiBuildPath)) {
  console.log('✅ UI folder found!');
  console.log('📁 UI files:', readdirSync(uiBuildPath).slice(0, 10));
  app.use(express.static(uiBuildPath));
} else {
  console.error('❌ UI folder NOT found at:', uiBuildPath);
  console.error('📁 Checking parent directories:');
  try {
    console.error('  Parent 1:', readdirSync(path.join(__dirname, '..')));
    console.error('  Parent 2:', readdirSync(path.join(__dirname, '..', '..')));
    console.error('  Parent 3 (should have ui):', readdirSync(path.join(__dirname, '..', '..', '..')));
  } catch (e) {
    console.error('  Could not read parent directories');
  }
}

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    port: port,
    appDir: __dirname,
    uiPath: uiBuildPath,
    uiExists: existsSync(uiBuildPath),
    filesInAppDir: readdirSync(__dirname),
    parentDirs: {
      parent1: readdirSync(path.join(__dirname, '..')),
      parent2: readdirSync(path.join(__dirname, '..', '..')),
      parent3: readdirSync(path.join(__dirname, '..', '..', '..'))
    }
  });
});

// API Routes - all prefixed with /api
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes)
app.use("/api/timesheets", timesheetRoutes)
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);


app.use(errorHandler);

// Serve React app for all other routes (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(uiBuildPath, 'index.html'));
});

server.listen(port, async () => {
  try {
    await connectDB();
    socketService.init(server);
    
    // Initialize and start cron jobs
    const cronJobService = new CronJobService();
    cronJobService.startScheduledJobs();
    
    console.log(`🚀 Server running on port ${port} in ${NODE_ENV} environment`);
    console.log(`📍 API available at: http://localhost:${port}/api`);
    console.log(`🎨 UI available at: http://localhost:${port}`);
  } catch (error) {
    console.error('Error during server startup:', error);
    // Don't exit the process, just log the error
  }
});
