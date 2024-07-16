import { JwtPayload } from "jsonwebtoken";
import createJWKsMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { RefreshToken } from "../../entity/RefreshToken";
import TokenService from "../../services/TokenService";
import { isJwt } from "../utils";

describe("GET /auth/validate-user", () => {
  let dataSource: DataSource;
  const endpoint = "/auth/validate-user";
  const refreshTokenEndpoint = "/auth/refresh";
  const registrationUserData = {
    firstName: "Sankha",
    lastName: "Chakraborty",
    email: "  iamsankhachak@gmail.com  ",
    password: "passwordSecret"
  };
  //   const userData = {
  //     email: "  iamsankhachak@gmail.com  ",
  //     password: "passwordSecret"
  //   };
  let jwks: ReturnType<typeof createJWKsMock>;

  beforeAll(async () => {
    jwks = createJWKsMock("http://localhost:5001");
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

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const loginResponse = await request(app)
        .get(endpoint)
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect(loginResponse.statusCode).toBe(200);
    });

    it("should return user data in the response", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const loginResponse = await request(app)
        .get(endpoint)
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect(loginResponse.body.id).toBe(response.body.id);
    });

    it("should not return user password in the response", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const loginResponse = await request(app)
        .get(endpoint)
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect(loginResponse.body).not.toHaveProperty("password");
    });

    it("should send new access token when refresh token is provided", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(registrationUserData);

      const refreshTokenInDb = await dataSource
        .getRepository(RefreshToken)
        .save({
          user: response.body,
          expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
        });

      const payload: JwtPayload = {
        id: refreshTokenInDb.id,
        sub: response.body.id,
        role: response.body.role
      };

      const tokenService = new TokenService();

      const refreshToken = tokenService.generateRefreshToken(payload);

      const refreshResponse = await request(app)
        .post(refreshTokenEndpoint)
        .set("Cookie", [`refreshToken=${refreshToken};`])
        .send();

      const cookies = (refreshResponse.headers["set-cookie"] || []) as string[];

      let accessToken: string = "";

      cookies.forEach((cookie) => {
        if (cookie.includes("accessToken")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken.length).toBeGreaterThan(0);
      expect(isJwt(accessToken)).toBe(true);
    });
  });

  describe("No access token provided", () => {
    it("should return 401 status code", async () => {
      const response = await request(app).get(endpoint).send();

      expect(response.statusCode).toBe(401);
    });
  });
});
