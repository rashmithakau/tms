import { Request } from "express";
import mongoose from "mongoose";
import { UserDocument } from "../models/user.model";
import { SessionDocument } from "../models/session.model";

declare module "express-serve-static-core" {
  interface Request {
    userId: UserDocument["_id"];
    sessionId: SessionDocument["_id"];
  }
}


