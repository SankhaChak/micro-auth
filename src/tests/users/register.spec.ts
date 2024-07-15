import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import HashService from "../../services/HashService";

describe("POST /auth/register", () => {
  let dataSource: DataSource;
  const userData = {
    firstName: "Sankha",
    lastName: "Chakraborty",
    email: "  iamsankhachak@gmail.com  ",
    password: "passwordSecret"
  };

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
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
        where: { email: userData.email.trim() }
      });

      expect(user).not.toBeNull();
    });

    it("should return the added user id", async () => {
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.body.id).toBeDefined();
    });

    it("should assign customer role to the newly created user", async () => {
      const response = await request(app).post("/auth/register").send(userData);
      const userInDb = await dataSource.getRepository(User).findOne({
        where: { id: response.body.id }
      });
      expect(userInDb).toHaveProperty("role", "customer");
    });

    it("should store password in hashed format", async () => {
      const response = await request(app).post("/auth/register").send(userData);
      const userInDb = await dataSource.getRepository(User).findOne({
        where: { id: response.body.id }
      });

      if (!userInDb) {
        throw new Error("User not found in the database");
      }

      const hashService = new HashService();
      const isPasswordMatch = await hashService.compareStrings(
        userData.password,
        userInDb.password
      );
      expect(isPasswordMatch).toBe(true);
    });

    it("should return 400 if email already exists", async () => {
      // Register the user first
      await request(app).post("/auth/register").send(userData);

      // Try to register the same user again
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);

      const userCreated = await dataSource.getRepository(User).find({
        where: { email: userData.email.trim() }
      });
      expect(userCreated).toHaveLength(1);
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 status code if email is not available", async () => {
      const userDataWithoutEmail = { ...userData } as { email?: string };
      delete userDataWithoutEmail.email;

      const response = await request(app)
        .post("/auth/register")
        .send(userDataWithoutEmail);
      expect(response.statusCode).toBe(400);

      const userCreated = await dataSource.getRepository(User).find({
        where: { email: userData.email }
      });
      expect(userCreated).toHaveLength(0);
    });

    it("should return 400 if password is missing", async () => {
      const userDataWithoutPassword = { ...userData } as { password?: string };
      delete userDataWithoutPassword.password;

      const response = await request(app)
        .post("/auth/register")
        .send(userDataWithoutPassword);
      expect(response.statusCode).toBe(400);

      const userCreated = await dataSource.getRepository(User).find({
        where: { email: userData.email }
      });
      expect(userCreated).toHaveLength(0);
    });
  });

  describe("Fields are not in correct format", () => {
    it("should trim the email before saving to DB", async () => {
      const response = await request(app).post("/auth/register").send(userData);
      const userCreated = await dataSource.getRepository(User).findOne({
        where: { id: response.body.id }
      });

      if (!userCreated) {
        throw new Error("User not found in the database");
      }

      expect(userCreated.email).toBe(userData.email.trim());
    });

    it("should return 400 if email is not in correct format", async () => {
      const userDataWithInvalidEmail = {
        ...userData,
        email: "invalid-email"
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userDataWithInvalidEmail);
      expect(response.statusCode).toBe(400);

      const userCreated = await dataSource.getRepository(User).find({
        where: { email: userData.email }
      });
      expect(userCreated).toHaveLength(0);
    });

    it("should return 400 if password length < 8 chars", async () => {
      const userDataWithShortPassword = {
        ...userData,
        password: "short"
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userDataWithShortPassword);
      expect(response.statusCode).toBe(400);

      const userCreated = await dataSource.getRepository(User).find({
        where: { email: userData.email }
      });
      expect(userCreated).toHaveLength(0);
    });
  });
});
