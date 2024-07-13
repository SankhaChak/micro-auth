import type { Response } from "express";
import UserService from "../services/UserService";
import { RegisterUserRequest } from "../types/auth";

class AuthController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async register(req: RegisterUserRequest, res: Response) {
    try {
      const rqBody = req.body;

      await this.userService.create(rqBody);

      res.status(201).json();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(500).json({ error: "An error occurred" });
    }
  }
}

export default AuthController;
