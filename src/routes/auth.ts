import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import AuthController from "../controllers/AuthController";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import HashService from "../services/HashService";
import UserService from "../services/UserService";
import loginValidator from "../validators/login-validator";
import registerValidator from "../validators/register-validator";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const hashService = new HashService();
const userService = new UserService(userRepository, hashService);
const authController = new AuthController(userService, hashService, logger);

router.post(
  "/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

router.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

export default router;
