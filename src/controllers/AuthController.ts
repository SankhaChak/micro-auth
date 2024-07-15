import type { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Logger } from "winston";
import { CONFIG } from "../config";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/RefreshToken";
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

      let privateKey: string;

      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, "../../certs/private.pem"),
          "utf-8"
        );
      } catch (err) {
        const error = createHttpError(500, "Error reading private key");
        throw error;
      }

      const payload: JwtPayload = { sub: String(user.id), role: user.role };

      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1d",
        issuer: "auth-service"
      });

      await AppDataSource.getRepository(RefreshToken).save({
        user,
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
      });

      const refreshToken = sign(payload, CONFIG.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "7d",
        issuer: "auth-service",
        jwtid: String(user.id)
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 // 1 day
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default AuthController;
