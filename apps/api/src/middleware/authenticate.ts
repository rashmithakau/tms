import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED, FORBIDDEN } from "../constants/http";
import { verifyToken } from "../utils/jwt";
import { UserRole } from "@tms/shared"; // Assuming you have a UserRole type defined

const authenticate = (requiredRoles?: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    const accessToken = req.cookies?.accessToken as string | undefined;

    // Ensure the access token exists
    appAssert(
      accessToken,
      UNAUTHORIZED,
      "Not authorized",
      AppErrorCode.InvalidAccessToken
    );

    const { error, payload } = verifyToken(accessToken);

    // Ensure the token is valid
    appAssert(
      payload,
      UNAUTHORIZED,
      error === "jwt expired" ? "Token expired" : "Invalid token",
      AppErrorCode.InvalidAccessToken
    );

    // Ensure the payload contains required fields
    appAssert(
      payload.userId && payload.sessionId && payload.role,
      UNAUTHORIZED,
      "Invalid token payload",
      AppErrorCode.InvalidAccessToken
    );

    // Attach user details to the request object
    req.userId = payload.userId;
    req.userRole = payload.role;
    req.sessionId = payload.sessionId;

    const userRole = payload.role as UserRole;

    // If roles are required, check if the user's role is allowed
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      appAssert(
        false,
        FORBIDDEN,
        "Access denied: insufficient permissions"
      );
    }

    next();
  };
};

export default authenticate;