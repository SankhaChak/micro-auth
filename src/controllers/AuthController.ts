import type { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import omit from "lodash/omit";
import { Repository } from "typeorm";
import { Logger } from "winston";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import CredentialService from "../services/CredentialService";
import TokenService from "../services/TokenService";
import UserService from "../services/UserService";
import {
  AuthRequest,
  LoginUserRequest,
  RegisterUserRequest
} from "../types/auth";

class AuthController {
  private userService: UserService;
  private tokenService: TokenService;
  private credentialService: CredentialService;

  private refreshTokenRepository: Repository<RefreshToken>;

  private logger: Logger;

  constructor(
    userService: UserService,
    tokenService: TokenService,
    credentialService: CredentialService,
    logger: Logger
  ) {
    this.userService = userService;
    this.tokenService = tokenService;
    this.credentialService = credentialService;

    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

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

      await this.attachTokenCookies(user, res, next);

      res.status(201).json({ id: user.id });
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

      await this.attachTokenCookies(user, res, next);

      res.status(200).json({ id: user.id });
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

      const sanitizedUser = this.getSanitizedUser(user);

      res.status(200).send(sanitizedUser);
    } catch (error) {
      next(error);
      return;
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.auth.sub);

      if (!user) {
        const error = createHttpError(404, "User not found");
        throw error;
      }

      const sanitizedUser = this.getSanitizedUser(user);

      await this.tokenService.deleteRefreshToken(req.auth.id as string);
      await this.attachTokenCookies(sanitizedUser, res, next);

      res.status(200).json({});
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
      const sanitizedUser = this.getSanitizedUser(user as User);

      const payload: JwtPayload = {
        sub: String(sanitizedUser.id),
        role: sanitizedUser.role
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshTokenInDb = await this.refreshTokenRepository.save({
        user,
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
      });

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: refreshTokenInDb.id
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 1000 // 1 day
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7 * 1000 // 7 days
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  getSanitizedUser(user: User) {
    return omit(user, ["password"]);
  }
}

export default AuthController;
