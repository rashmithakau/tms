import { Router } from "express";
import { loginHandler,refreshHandler,registerHandler } from "../controllers/auth.controller";

const authRoutes=Router();

authRoutes.post("/register", registerHandler); //should be change just for testing
authRoutes.post("/login",loginHandler);
authRoutes.get("/refresh", refreshHandler);

export default authRoutes;