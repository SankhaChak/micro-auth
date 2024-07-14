import express from "express";
import logger from "../config/logger";
import AuthController from "../controllers/AuthController";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import HashService from "../services/HashService";
import UserService from "../services/UserService";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const hashService = new HashService();
const userService = new UserService(userRepository, hashService);
const authController = new AuthController(userService, logger);

router.post("/register", (req, res, next) =>
  authController.register(req, res, next)
);

export default router;
