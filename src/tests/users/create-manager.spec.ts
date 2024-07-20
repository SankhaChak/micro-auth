import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entity/Tenant";
import { UserRole } from "../../types/auth";

describe("POST /users", () => {
  let dataSource: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let nonAdminToken: string;
  let tenant: Tenant;

  const endpoint = "/users";
  const managerUserData = {
    firstName: "Sankha",
    lastName: "Chakraborty",
    email: "yobud@gmail.com",
    password: "passwordSecret",
    role: "manager",
    tenantId: 1
  };

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5001");

    jwks.start();
    adminToken = jwks.token({
      sub: "1",
      role: UserRole.Admin
    });
    nonAdminToken = jwks.token({
      sub: "2",
      role: UserRole.Customer
    });

    dataSource = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();

    tenant = await AppDataSource.getRepository(Tenant).save({
      name: "Tenant 1",
      address: "Address 1"
    });
    managerUserData.tenantId = tenant.id;
  });

  afterAll(async () => {
    jwks.stop();
    await dataSource.destroy();
  });

  describe("All fields provided", () => {
    it("should return 201 status code", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(managerUserData);

      expect(response.statusCode).toBe(201);
    });

    it("should save the user to the database with manager role", async () => {
      await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(managerUserData);

      const user = await dataSource.getRepository("User").findOne({
        where: { email: managerUserData.email }
      });

      if (!user) {
        throw new Error("Error saving manager to the database");
      }

      expect(user).toBeDefined();
      expect(user.role).toBe(UserRole.Manager);
    });

    it("should return 401 status code if user is unauthenticated", async () => {
      const response = await request(app).post(endpoint).send(managerUserData);
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code if user is unauthorized", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${nonAdminToken};`])
        .send(managerUserData);
      expect(response.statusCode).toBe(403);
    });
  });

  describe("Missing fields", () => {
    it("should return 400 status code if firstName is missing", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({ ...managerUserData, firstName: undefined });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is missing", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({ ...managerUserData, lastName: undefined });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if email is missing", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({ ...managerUserData, email: undefined });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if password is missing", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({ ...managerUserData, password: undefined });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if tenantId is missing", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({ ...managerUserData, tenantId: undefined });

      expect(response.statusCode).toBe(400);
    });
  });
});
