import { Router } from "express";
import {createHandler, listHandler, listMyProjectsHandler, updateStaffHandler, deleteHandler, listSupervisedProjectsHandler} from "../controllers/project.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const projectRoutes=Router();

projectRoutes.post("/", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), createHandler);
projectRoutes.get("/",authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), listHandler);
projectRoutes.get("/my-projects", authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), listMyProjectsHandler);
projectRoutes.get("/supervised", authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), listSupervisedProjectsHandler);
projectRoutes.put("/:id/staff", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), updateStaffHandler);
projectRoutes.delete("/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), deleteHandler);

export default projectRoutes;