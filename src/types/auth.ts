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

export enum UserRole {
  Customer = "customer",
  Admin = "admin",
  Manager = "manager"
}
