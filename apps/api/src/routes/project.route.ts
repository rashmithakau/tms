import { Router } from "express";
import {createHandler, listHandler, updateStaffHandler, deleteHandler} from "../controllers/project.controller";

const projectRoutes=Router();

projectRoutes.post("/", createHandler);
projectRoutes.get("/", listHandler);
projectRoutes.put("/:id/staff", updateStaffHandler);
projectRoutes.delete("/:id", deleteHandler);

export default projectRoutes;