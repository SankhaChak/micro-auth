import { expressjwt } from "express-jwt";
import jwksClient, { GetVerificationKey } from "jwks-rsa";
import isUndefined from "lodash/isUndefined";
import { CONFIG } from "../config";

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

export default authenticateMiddleware;
