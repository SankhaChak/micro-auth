import { expressjwt } from "express-jwt";
import { CONFIG } from "../config";

const parseRefreshToken = expressjwt({
  secret: CONFIG.REFRESH_TOKEN_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => {
    const { refreshToken } = req.cookies as { refreshToken: string };
    return refreshToken;
  }
});

export default parseRefreshToken;
