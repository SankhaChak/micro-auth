import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { UserRole } from "../../types/auth";
import { populateTenants, populateUsers } from "../utils";

describe("PATCH /users/:id", () => {
  let dataSource: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let nonAdminToken: string;

  const singleUserEndpoint = "/users/1";
  const numberOfUsersToPopulate = 5;

  const updateUserData: Partial<User> = {
    firstName: "Updated First Name",
    lastName: "Updated Last Name",
    email: "updatedemail@gmail.com",
    role: UserRole.Manager
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

    await populateTenants(dataSource);
  });

  afterAll(async () => {
    jwks.stop();

    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe("Update user", () => {
    it("should return 200 status code", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .patch(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(updateUserData);
      expect(response.statusCode).toBe(200);
    });

    it("should return the updated user", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .patch(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(updateUserData);

      expect(response.body.firstName).toBe(updateUserData.firstName);
      expect(response.body.lastName).toBe(updateUserData.lastName);
      expect(response.body.email).toBe(updateUserData.email);
      expect(response.body.role).toBe(updateUserData.role);
    });

    it("should return 404 status code if user with the provided id does not exist", async () => {
      const response = await request(app)
        .patch("/users/100")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(updateUserData);
      expect(response.statusCode).toBe(404);
    });

    it("should return 400 status code if email is already taken", async () => {
      const userPayload = await populateUsers(
        dataSource,
        numberOfUsersToPopulate
      );

      const response = await request(app)
        .patch(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({ ...updateUserData, email: userPayload[0].email });
      expect(response.statusCode).toBe(400);
    });

    it("should return 403 status code if user is not an admin", async () => {
      const response = await request(app)
        .patch(singleUserEndpoint)
        .set("Cookie", [`accessToken=${nonAdminToken};`])
        .send(updateUserData);
      expect(response.statusCode).toBe(403);
    });

    it("should return 401 status code if user is unauthenticated", async () => {
      const response = await request(app)
        .patch(singleUserEndpoint)
        .send(updateUserData);
      expect(response.statusCode).toBe(401);
    });

    it("should only update the provided fields", async () => {
      const userPayload = await populateUsers(
        dataSource,
        numberOfUsersToPopulate
      );

      const response = await request(app)
        .patch(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({ firstName: "Updated First Name" });

      expect(response.body.firstName).toBe("Updated First Name");
      expect(response.body.lastName).toBe(userPayload[0].lastName);
      expect(response.body.email).toBe(userPayload[0].email);
      expect(response.body.role).toBe(userPayload[0].role);
    });

    it("should not return user password in the response", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .patch(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(updateUserData);

      expect(response.body).not.toHaveProperty("password");
    });
  });
});
