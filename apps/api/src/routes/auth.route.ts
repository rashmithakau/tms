import { Router } from "express";
import { loginHandler,refreshHandler,logoutHandler} from "../controllers/auth.controller";
import authenticate from "../middleware/authenticate";

const authRoutes=Router();

authRoutes.post("/login",loginHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/logout", logoutHandler)

export default authRoutes;