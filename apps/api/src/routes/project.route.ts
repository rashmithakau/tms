import { Router } from "express";
import {createHandler, listHandler, updateStaffHandler, deleteHandler} from "../controllers/project.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const projectRoutes=Router();

projectRoutes.post("/", createHandler);
projectRoutes.get("/",authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.Admin,UserRole.SuperAdmin]), listHandler);
projectRoutes.put("/:id/staff", updateStaffHandler);
projectRoutes.delete("/:id", deleteHandler);

export default projectRoutes;