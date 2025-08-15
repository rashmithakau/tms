import { Router } from "express";



import { loginHandler,refreshHandler,changePasswordHandler,logoutHandler} from "../controllers/auth.controller";

import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const authRoutes=Router();

authRoutes.post("/login",loginHandler);
authRoutes.get("/refresh", refreshHandler);

authRoutes.get("/logout", logoutHandler)

authRoutes.post("/change-password", authenticate([UserRole.Admin,UserRole.Emp,UserRole.SuperAdmin,UserRole.Supervisor]),changePasswordHandler);




export default authRoutes;