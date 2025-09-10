import { Router } from "express";
import {createHandler, listHandler, updateStaffHandler, deleteHandler, listSupervisedProjectsHandler} from "../controllers/project.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const projectRoutes=Router();

projectRoutes.post("/", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), createHandler);
projectRoutes.get("/",authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin]), listHandler);
projectRoutes.get("/supervised", authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin]), listSupervisedProjectsHandler);
projectRoutes.put("/:id/staff", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), updateStaffHandler);
projectRoutes.delete("/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), deleteHandler);

export default projectRoutes;