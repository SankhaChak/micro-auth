import createJWKsMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";

describe("GET /auth/validate-user", () => {
  let dataSource: DataSource;
  const endpoint = "/auth/validate-user";
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
    jwks = createJWKsMock("http://localhost:5501");
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
  });
});
