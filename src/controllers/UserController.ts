import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import UserService from "../services/UserService";
import { CreateUserRequest } from "../types/user";
import AuthController from "./AuthController";

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

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      const users = await this.userService.findAll();

      const sanitizedUsers = users.map((user) =>
        AuthController.getSanitizedUser(user)
      );

      return res.status(200).json(sanitizedUsers);
    } catch (err) {
      this.logger.error(err);
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        const error = createHttpError(404, `User with id ${id} not found`);
        throw error;
      }

      const sanitizedUser = AuthController.getSanitizedUser(user);

      return res.status(200).json(sanitizedUser);
    } catch (err) {
      this.logger.error(err);
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      const { id } = req.params;
      const user = await this.userService.update(id, req.body);

      const sanitizedUser = AuthController.getSanitizedUser(user);

      return res.status(200).json(sanitizedUser);
    } catch (err) {
      this.logger.error(err);
      return next(err);
    }
  }
}

export default UserController;
