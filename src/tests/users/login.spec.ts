import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { RefreshToken } from "../../entity/RefreshToken";
import { User } from "../../entity/User";
import { isJwt } from "../utils";

describe("POST /auth/login", () => {
  let dataSource: DataSource;
  const registrationUserData = {
    firstName: "Sankha",
    lastName: "Chakraborty",
    email: "  iamsankhachak@gmail.com  ",
    password: "passwordSecret"
  };
  const userData = {
    email: "  iamsankhachak@gmail.com  ",
    password: "passwordSecret"
  };
  const endpoint = "/auth/login";

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();

    await request(app).post("/auth/register").send(registrationUserData);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("All fields provided", () => {
    it("should return 200", async () => {
      const response = await request(app).post(endpoint).send(userData);
      expect(response.statusCode).toBe(200);
    });

    it("should return valid json response", async () => {
      const response = await request(app).post(endpoint).send(userData);
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    it("should return the user id", async () => {
      const response = await request(app).post(endpoint).send(userData);
      expect(response.body.id).toBeDefined();
    });

    it("should return 401 if email does not exist", async () => {
      const payload = { ...userData, email: "someradnomemail@gmail.com" };

      const response = await request(app).post(endpoint).send(payload);
      expect(response.statusCode).toBe(401);
    });

    it("should return 401 if password is incorrect", async () => {
      const payload = { ...userData, password: "randomgibberish" };

      const response = await request(app).post(endpoint).send(payload);
      expect(response.statusCode).toBe(401);
    });

    it("should return access and refresh token in a cookie", async () => {
      const response = await request(app).post(endpoint).send(userData);
      const cookies = (response.headers["set-cookie"] || []) as string[];

      let accessToken: string = "";
      let refreshToken: string = "";

      cookies.forEach((cookie) => {
        if (cookie.includes("accessToken")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        } else if (cookie.includes("refreshToken")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken.length).toBeGreaterThan(0);
      expect(refreshToken.length).toBeGreaterThan(0);
      expect(isJwt(accessToken)).toBe(true);
      expect(isJwt(refreshToken)).toBe(true);
    });

    it("should store the refresh token in the database", async () => {
      const response = await request(app).post(endpoint).send(userData);
      const user = await dataSource.getRepository(User).findOne({
        where: { id: response.body.id }
      });

      const tokens = await dataSource
        .createQueryBuilder(RefreshToken, "rt")
        .where("rt.user = :userId", { userId: user?.id })
        .getMany();

      expect(tokens).toHaveLength(2);
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 status code if email is missing", async () => {
      const userDataWithoutEmail = { ...userData } as { email?: string };
      delete userDataWithoutEmail.email;

      const response = await request(app)
        .post(endpoint)
        .send(userDataWithoutEmail);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if password is missing", async () => {
      const userDataWithoutPassword = { ...userData } as { password?: string };
      delete userDataWithoutPassword.password;

      const response = await request(app)
        .post(endpoint)
        .send(userDataWithoutPassword);
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Fields are not in correct format", () => {
    it("should trim the email before trying to login", async () => {
      const response = await request(app).post(endpoint).send(userData);

      const user = await dataSource.getRepository(User).findOne({
        where: { id: response.body.id }
      });

      expect(user?.email).toBe(registrationUserData.email.trim());
    });
  });
});
