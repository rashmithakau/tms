import { Router } from "express";
import { registerHandler } from "../controllers/user.controller";

const userhRoutes=Router();

userhRoutes.post("/", registerHandler); 

export default userhRoutes;