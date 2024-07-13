import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { truncateTables } from "../utils";

describe("POST /auth/register", () => {
  let dataSource: DataSource;
  const userData = {
    firstName: "Sankha",
    lastName: "Chakraborty",
    email: "iamsankhachak@gmail.com",
    password: "passwordSecret"
  };

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await truncateTables(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("All fields provided", () => {
    it("should return 201", async () => {
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    it("should add the user to the database", async () => {
      await request(app).post("/auth/register").send(userData);

      const userRepository = dataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { email: userData.email }
      });

      expect(user).not.toBeNull();
    });

    it("should return the added user id", async () => {
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.body.id).toBeDefined();
    });
  });
  describe("Fields are missing", () => {});
});
