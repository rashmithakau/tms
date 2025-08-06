import { Router } from "express";
import { loginHandler,refreshHandler} from "../controllers/auth.controller";

const authRoutes=Router();

authRoutes.post("/login",loginHandler);
authRoutes.get("/refresh", refreshHandler);

export default authRoutes;