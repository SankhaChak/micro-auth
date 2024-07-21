import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import UserController from "../controllers/UserController";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import authenticateMiddleware from "../middlewares/authenticate";
import canAccess from "../middlewares/canAccess";
import CredentialService from "../services/CredentialService";
import UserService from "../services/UserService";
import { UserRole } from "../types/auth";
import createUserValidator, {
  updateUserValidator
} from "../validators/user-validator";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService);

const userController = new UserController(userService, logger);

router.post(
  "/",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  createUserValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
);

router.get(
  "/",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  // getUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next)
);

router.get(
  "/:id",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  // getUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getById(req, res, next)
);

router.patch(
  "/:id",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  updateUserValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.update(req, res, next)
);

export default router;
