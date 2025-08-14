import { Router } from "express";
import { registerHandler } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const userhRoutes=Router();

userhRoutes.post("/admin",authenticate([UserRole.SuperAdmin]), registerHandler(UserRole.Admin)); 
userhRoutes.post("/emp",authenticate([UserRole.Admin]),registerHandler(UserRole.Emp)); 

export default userhRoutes;