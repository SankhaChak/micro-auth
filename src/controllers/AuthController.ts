import type { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import UserService from "../services/UserService";
import { RegisterUserRequest } from "../types/auth";

class AuthController {
  private userService: UserService;
  private logger: Logger;

  constructor(userService: UserService, logger: Logger) {
    this.userService = userService;
    this.logger = logger;
  }

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const rqBody = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      this.logger.debug("Request to register new user", {
        email: rqBody.email,
        firstName: rqBody.firstName,
        lastName: rqBody.lastName
      });

      const user = await this.userService.create(rqBody);
      this.logger.info("User has been registered", {
        id: user.id,
        email: user.email
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default AuthController;
