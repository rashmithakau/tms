import { Router } from "express";
import { registerHandler, getUserHandler, deleteUserHandler, getAllActiveUsersHandler, getAllUsersIncludingInactiveHandler } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const userhRoutes=Router();

userhRoutes.post("/admin",authenticate([UserRole.SuperAdmin]), registerHandler(UserRole.Admin)); 
userhRoutes.get("/admin",authenticate([UserRole.SuperAdmin]), getUserHandler([UserRole.Emp, UserRole.Supervisor])); 
userhRoutes.post("/emp",authenticate([UserRole.Admin]),registerHandler(UserRole.Emp)); 
userhRoutes.get("/emp",authenticate([UserRole.Admin]), getUserHandler(UserRole.Emp));
userhRoutes.get("/supervisor", authenticate([UserRole.Admin]), getUserHandler(UserRole.Supervisor));
userhRoutes.delete("/emp/:id", authenticate([UserRole.Admin]), deleteUserHandler());
userhRoutes.delete("/supervisor/:id", authenticate([UserRole.Admin]), deleteUserHandler());
userhRoutes.delete("/:id", authenticate([UserRole.Admin]), deleteUserHandler());
userhRoutes.get("/active", authenticate([UserRole.Admin]), getAllActiveUsersHandler());
userhRoutes.get("/all", authenticate([UserRole.Admin]), getAllUsersIncludingInactiveHandler());

export default userhRoutes;