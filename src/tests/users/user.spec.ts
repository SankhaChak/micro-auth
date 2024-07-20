import createJWKsMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { extractAuthTokensFromCookies, isJwt } from "../utils";

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
  // const userData = {
  //   email: "  iamsankhachak@gmail.com  ",
  //   password: "passwordSecret"
  // };
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

      const cookiesInResponse = (response.headers["set-cookie"] ||
        []) as string[];

      const { refreshToken } = extractAuthTokensFromCookies(cookiesInResponse);

      const accessToken = jwks.token({
        sub: response.body.id,
        role: response.body.role
      });

      const refreshResponse = await request(app)
        .post(refreshTokenEndpoint)
        .set("Cookie", [`refreshToken=${refreshToken};`])
        .send();

      const cookies = (refreshResponse.headers["set-cookie"] || []) as string[];
      const { accessToken: newAccessToken } =
        extractAuthTokensFromCookies(cookies);

      expect(newAccessToken.length).toBeGreaterThan(0);
      expect(accessToken).not.toBe(newAccessToken);
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
