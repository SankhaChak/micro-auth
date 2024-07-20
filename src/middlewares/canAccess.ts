import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { AuthRequest, UserRole } from "../types/auth";

const canAccess = (roles: UserRole[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const typedReq = req as AuthRequest;
    const userRole = typedReq.auth.role;

    if (!roles.includes(userRole)) {
      const error = createHttpError(403, "Forbidden");
      throw error;
    }

    next();
  };
};

export default canAccess;
