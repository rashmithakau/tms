import { Router } from "express";
import {createHandler} from "../controllers/project.controller";

const projectRoutes=Router();

projectRoutes.post("/", createHandler);

export default projectRoutes;