import { Request } from "express";

export interface AuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}
export interface RegisterUserRequest extends Request {
  body: AuthUserData;
}

export interface LoginUserRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export enum UserRole {
  Customer = "customer",
  Admin = "admin",
  Manager = "manager"
}

export interface AuthRequest extends Request {
  auth: {
    id?: string;
    sub: string;
    role: UserRole;
  };
}
