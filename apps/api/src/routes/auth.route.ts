import { Router } from "express";



import { loginHandler,refreshHandler,changePasswordHandler,logoutHandler} from "../controllers/auth.controller";

import authenticate from "../middleware/authenticate";

const authRoutes=Router();

authRoutes.post("/login",loginHandler);
authRoutes.get("/refresh", refreshHandler);

authRoutes.get("/logout", logoutHandler)

authRoutes.post("/change-password", authenticate,changePasswordHandler);




export default authRoutes;