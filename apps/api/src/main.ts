import express from 'express';
import connectDB from './config/db';
import { APP_ORIGIN, NODE_ENV, PORT } from './constants/env';
import cors from 'cors';
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth.route";
import userhRoutes from './routes/user.route';
import projectRoutes from './routes/project.route';
import authenticate from './middleware/authenticate';

const port = Number(PORT);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/auth",authRoutes);
app.use("/api/user",userhRoutes);//remove authenticate for development purposes
app.use("/api/project",projectRoutes)

app.use(errorHandler);

app.listen(port,async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);
});
