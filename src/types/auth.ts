import { Request } from "express";

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}
export interface RegisterUserRequest extends Request {
  body: UserData;
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
    sub: string;
    role: UserRole;
  };
}
