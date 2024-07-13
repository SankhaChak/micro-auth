import { Request } from "express";

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
export interface RegisterUserRequest extends Request {
  body: UserData;
}
