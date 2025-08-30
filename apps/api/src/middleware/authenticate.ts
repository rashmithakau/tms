import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED, FORBIDDEN } from "../constants/http";
import { verifyToken } from "../utils/jwt";
import { UserRole } from "@tms/shared"; // Assuming you have a UserRole type defined

const authenticate = (requiredRoles?: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    console.log('Auth middleware: checking authentication for path:', req.path);
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
    req.sessionId = payload.sessionId;

    const userRole = payload.role as UserRole;
    console.log('Auth middleware: user authenticated with role:', userRole, 'required roles:', requiredRoles);

    // If roles are required, check if the user's role is allowed
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      console.log('Auth middleware: access denied - user role:', userRole, 'not in required roles:', requiredRoles);
      appAssert(
        false,
        FORBIDDEN,
        "Access denied: insufficient permissions"
      );
    }

    console.log('Auth middleware: authentication successful');
    next();
  };
};

export default authenticate;