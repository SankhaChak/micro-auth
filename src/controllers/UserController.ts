import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import UserService from "../services/UserService";
import { CreateUserRequest } from "../types/user";

class UserController {
  private userService: UserService;

  private logger: Logger;

  constructor(userService: UserService, logger: Logger) {
    this.userService = userService;
    this.logger = logger;
  }

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const rqBody = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      const user = await this.userService.create(rqBody);

      return res.status(201).json({ id: user.id });
    } catch (err) {
      this.logger.error(err);
      return next(err);
    }
  }
}

export default UserController;
