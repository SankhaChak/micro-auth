import express from "express";
import logger from "../config/logger";
import AuthController from "../controllers/AuthController";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import UserService from "../services/UserService";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

router.post("/register", (req, res, next) =>
  authController.register(req, res, next)
);

export default router;
