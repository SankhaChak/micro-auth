import type { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import omit from "lodash/omit";
import path from "path";
import { Logger } from "winston";
import { CONFIG } from "../config";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import CredentialService from "../services/CredentialService";
import UserService from "../services/UserService";
import {
  AuthRequest,
  LoginUserRequest,
  RegisterUserRequest
} from "../types/auth";

class AuthController {
  private userService: UserService;
  private credentialService: CredentialService;
  private logger: Logger;

  constructor(
    userService: UserService,
    credentialService: CredentialService,
    logger: Logger
  ) {
    this.userService = userService;
    this.credentialService = credentialService;
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

      const sanitizedUser = omit(user, ["password"]);

      await this.attachTokenCookies(sanitizedUser, res, next);

      res.status(201).json(user);
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: LoginUserRequest, res: Response, next: NextFunction) {
    try {
      const rqBody = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      this.logger.debug("Request to login", {
        email: rqBody.email
      });

      const user = await this.userService.findByEmail(rqBody.email);

      if (!user) {
        const error = createHttpError(401, "Invalid email or password");
        throw error;
      }

      const isValidPassowrd = await this.credentialService.compareStrings(
        rqBody.password,
        user.password
      );

      if (!isValidPassowrd) {
        const error = createHttpError(401, "Invalid email or password");
        throw error;
      }

      const sanitizedUser = omit(user, ["password"]);

      await this.attachTokenCookies(sanitizedUser, res, next);

      res.status(200).json(sanitizedUser);
    } catch (error) {
      next(error);
      return;
    }
  }

  async validateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.auth.sub);

      if (!user) {
        const error = createHttpError(404, "User not found");
        throw error;
      }

      const sanitizedUser = omit(user, ["password"]);

      res.status(200).send(sanitizedUser);
    } catch (error) {
      next(error);
      return;
    }
  }

  async attachTokenCookies(
    user: Partial<User>,
    res: Response,
    next: NextFunction
  ) {
    try {
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
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default AuthController;
