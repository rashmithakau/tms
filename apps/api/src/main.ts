import express from 'express';
import http from 'http';
import path from 'path';
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
const uiBuildPath = path.join(__dirname, 'ui');
app.use(express.static(uiBuildPath));

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    port: port
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
