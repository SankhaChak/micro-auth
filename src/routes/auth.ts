import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import AuthController from "../controllers/AuthController";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import CredentialService from "../services/CredentialService";
import UserService from "../services/UserService";
import loginValidator from "../validators/login-validator";
import registerValidator from "../validators/register-validator";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService);
const authController = new AuthController(
  userService,
  credentialService,
  logger
);

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
