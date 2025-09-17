import { Router } from "express";
import { registerHandler, getUserHandler, deleteUserHandler, getAllActiveUsersHandler, getAllUsersIncludingInactiveHandler } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const userhRoutes=Router();

userhRoutes.post("/admin",authenticate([UserRole.SuperAdmin]), registerHandler(UserRole.Admin)); 
userhRoutes.get("/admin",authenticate([UserRole.SuperAdmin, UserRole.Admin, UserRole.SupervisorAdmin]), getUserHandler([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin])); 
userhRoutes.post("/emp",authenticate([UserRole.Admin, UserRole.SupervisorAdmin]),registerHandler(UserRole.Emp)); 
userhRoutes.get("/emp",authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), getUserHandler(UserRole.Emp));
userhRoutes.get("/supervisor", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), getUserHandler([UserRole.Supervisor, UserRole.SupervisorAdmin]));
userhRoutes.delete("/emp/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), deleteUserHandler());
userhRoutes.delete("/supervisor/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), deleteUserHandler());
userhRoutes.delete("/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), deleteUserHandler());
userhRoutes.get("/active", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), getAllActiveUsersHandler());
userhRoutes.get("/all", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), getAllUsersIncludingInactiveHandler());

export default userhRoutes;