import { Router } from "express";
import { registerHandler, getUserHandler } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const userhRoutes=Router();

userhRoutes.post("/admin",authenticate([UserRole.SuperAdmin]), registerHandler(UserRole.Admin)); 
userhRoutes.get("/admin",authenticate([UserRole.SuperAdmin]), getUserHandler(UserRole.Admin)); 
userhRoutes.post("/emp",authenticate([UserRole.Admin]),registerHandler(UserRole.Emp)); 
userhRoutes.get("/emp",authenticate([UserRole.Admin]), getUserHandler(UserRole.Emp));
// List supervisors
userhRoutes.get("/supervisor", authenticate([UserRole.Admin]), getUserHandler(UserRole.Supervisor));

export default userhRoutes;