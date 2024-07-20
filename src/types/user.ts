import { Request } from "express";
import { UserRole } from "./auth";

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  tenantId: number;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}
