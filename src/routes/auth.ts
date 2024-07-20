import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import AuthController from "../controllers/AuthController";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import authenticateMiddleware, {
  validateRefreshTokenMiddleware
} from "../middlewares/authenticate";
import parseRefreshToken from "../middlewares/token";
import CredentialService from "../services/CredentialService";
import TokenService from "../services/TokenService";
import UserService from "../services/UserService";
import { AuthRequest } from "../types/auth";
import loginValidator from "../validators/login-validator";
import registerValidator from "../validators/register-validator";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const credentialService = new CredentialService();
const tokenService = new TokenService();

const userService = new UserService(userRepository, credentialService);

const authController = new AuthController(
  userService,
  tokenService,
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

router.get(
  "/validate-user",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    authController.validateUser(req as AuthRequest, res, next)
);

router.post(
  "/refresh",
  validateRefreshTokenMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next)
);

router.post(
  "/logout",
  authenticateMiddleware,
  validateRefreshTokenMiddleware,
  parseRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next)
);

export default router;
