import type { Request, Response } from "express";

class AuthController {
  async register(req: Request, res: Response) {
    res.status(201).json();
  }
}

export default AuthController;
