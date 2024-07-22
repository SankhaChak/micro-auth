import { JwtPayload, sign } from "jsonwebtoken";
import { CONFIG } from "../config";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/RefreshToken";

class TokenService {
  generateAccessToken(payload: JwtPayload) {
    // let privateKey: string;

    // try {
    //   privateKey = fs.readFileSync(
    //     path.join(__dirname, "../../certs/private.pem"),
    //     "utf-8"
    //   );
    // } catch (err) {
    //   const error = createHttpError(500, "Error reading private key");
    //   throw error;
    // }

    const accessToken = sign(payload, CONFIG.PRIVATE_KEY, {
      algorithm: "RS256",
      expiresIn: "1d",
      issuer: "auth-service"
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, CONFIG.REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "auth-service",
      jwtid: String(payload.id)
    });

    return refreshToken;
  }

  async deleteRefreshToken(refreshTokenId: string) {
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    await refreshTokenRepository.delete({
      id: +refreshTokenId
    });
  }
}

export default TokenService;
