import { Request } from "express";
import { expressjwt } from "express-jwt";
import { Jwt, JwtPayload } from "jsonwebtoken";
import jwksClient, { GetVerificationKey } from "jwks-rsa";
import isUndefined from "lodash/isUndefined";
import { CONFIG } from "../config";
import logger from "../config/logger";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/RefreshToken";

const authenticateMiddleware = expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: CONFIG.JWKS_URI,
    cache: true,
    rateLimit: true
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  getToken: (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && !isUndefined(authHeader.split(" ")[1])) {
      const token = authHeader.split(" ")[1];
      return token;
    }

    const { accessToken } = req.cookies as { accessToken: string };
    return accessToken;
  }
});

export const validateRefreshTokenMiddleware = expressjwt({
  secret: CONFIG.REFRESH_TOKEN_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => {
    const { refreshToken } = req.cookies as { refreshToken: string };
    return refreshToken;
  },
  isRevoked: async (_req: Request, token?: Jwt) => {
    if (!token) {
      return true;
    }

    try {
      const tokenId = (token.payload as JwtPayload).id as string;
      const userId = (token.payload as JwtPayload).sub as string;

      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const tokenInDb = await refreshTokenRepository.findOne({
        where: { id: +tokenId, user: { id: +userId } }
      });
      return !tokenInDb;
    } catch (error) {
      logger.error("Error while getting the refresh token", {
        id: (token.payload as JwtPayload).id
      });
      return true;
    }
  }
});

export default authenticateMiddleware;
