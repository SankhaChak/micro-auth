import { jwtDecode } from "jwt-decode";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { RefreshToken } from "../../entity/RefreshToken";
import { extractAuthTokensFromCookies } from "../utils";

describe("POST /auth/logout", () => {
  let dataSource: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  const endpoint = "/auth/logout";
  const registrationUserData = {
    firstName: "Sankha",
    lastName: "Chakraborty",
    email: "  iamsankhachak@gmail.com  ",
    password: "passwordSecret"
  };

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5001");
    dataSource = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterEach(async () => {
    jwks.stop();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("All fields provided", () => {
    it("should return 200 status code", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const responseCookies = (response.headers["set-cookie"] ||
        []) as string[];

      const { refreshToken } = extractAuthTokensFromCookies(responseCookies);

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const logoutResponse = await request(app)
        .post(endpoint)
        .set("Cookie", [
          `accessToken=${accessToken};`,
          `refreshToken=${refreshToken};`
        ])
        .send();

      expect(logoutResponse.statusCode).toBe(200);
    });
    it("should clear the access and refresh token cookie", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const responseCookies = (response.headers["set-cookie"] ||
        []) as string[];

      const { refreshToken } = extractAuthTokensFromCookies(responseCookies);

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const logoutResponse = await request(app)
        .post(endpoint)
        .set("Cookie", [
          `accessToken=${accessToken};`,
          `refreshToken=${refreshToken};`
        ])
        .send();

      const logoutResponseCookies = (logoutResponse.headers["set-cookie"] ||
        []) as string[];

      const {
        accessToken: logoutResponseAccessToken,
        refreshToken: logoutResponseRefreshToken
      } = extractAuthTokensFromCookies(logoutResponseCookies);

      expect(logoutResponseAccessToken).toHaveLength(0);
      expect(logoutResponseRefreshToken).toHaveLength(0);
    });
    it("should delete the refresh token from the database", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const responseCookies = (response.headers["set-cookie"] ||
        []) as string[];

      const { refreshToken } = extractAuthTokensFromCookies(responseCookies);

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      await request(app)
        .post(endpoint)
        .set("Cookie", [
          `accessToken=${accessToken};`,
          `refreshToken=${refreshToken};`
        ])
        .send();

      const parsedRefreshToken = jwtDecode(refreshToken);

      if (!parsedRefreshToken.jti) {
        throw new Error("Refresh token does not have a jti");
      }

      const refreshTokenInDb = await dataSource
        .getRepository(RefreshToken)
        .findOne({
          where: {
            id: +parsedRefreshToken.jti
          }
        });

      expect(refreshTokenInDb).toBeNull();
    });
    it("should return 401 if the refresh token does not exist", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const responseCookies = (response.headers["set-cookie"] ||
        []) as string[];

      const { refreshToken } = extractAuthTokensFromCookies(responseCookies);

      const parsedRefreshToken = jwtDecode(refreshToken);

      if (!parsedRefreshToken.jti) {
        throw new Error("Refresh token does not have a jti");
      }

      await dataSource.getRepository(RefreshToken).delete({
        id: +parsedRefreshToken.jti
      });

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const logoutResponse = await request(app)
        .post(endpoint)
        .set("Cookie", [
          `accessToken=${accessToken};`,
          `refreshToken=${refreshToken};`
        ])
        .send();

      expect(logoutResponse.statusCode).toBe(401);
    });
  });

  describe("Fields missing", () => {
    it("should return 400 if the refresh token is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const logoutResponse = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect(logoutResponse.statusCode).toBe(401);
    });
  });
});
