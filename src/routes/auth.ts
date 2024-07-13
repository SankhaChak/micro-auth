import express from "express";
import AuthController from "../controllers/AuthController";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import UserService from "../services/UserService";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

router.post("/register", (req, res) => authController.register(req, res));

export default router;
