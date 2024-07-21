import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { UserRole } from "../../types/auth";
import { populateTenants, populateUsers } from "../utils";

describe("GET /users & /users/:id", () => {
  let dataSource: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let nonAdminToken: string;

  const allUsersEndpoint = "/users";
  const singleUserEndpoint = "/users/1";
  const numberOfUsersToPopulate = 5;

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

  describe("List all users", () => {
    it("should return 200 status code", async () => {
      const response = await request(app)
        .get(allUsersEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it("should return a list of users", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .get(allUsersEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.body).toHaveLength(numberOfUsersToPopulate);
    });

    // it("should return a list of users filtered by role", async () => {
    //   const usersPayload = await populateUsers(
    //     dataSource,
    //     numberOfUsersToPopulate
    //   );

    //   const response = await request(app)
    //     .get(allUsersEndpoint)
    //     .set("Cookie", [`accessToken=${adminToken};`])
    //     .query({ role: UserRole.Manager })
    //     .send();

    //   expect(response.body).toHaveLength(
    //     usersPayload.filter((user) => user.role === UserRole.Manager).length
    //   );
    // });

    it("should return 401 status code when user is unauthenticated", async () => {
      const response = await request(app).get(allUsersEndpoint).send();
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code when user is unauthorized", async () => {
      const response = await request(app)
        .get(allUsersEndpoint)
        .set("Cookie", [`accessToken=${nonAdminToken};`])
        .send();
      expect(response.statusCode).toBe(403);
    });

    it("should not return user password in the response", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .get(allUsersEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();

      const doesUsersHavePassword = response.body.some(
        (user: Partial<User>) => {
          return !!user.password;
        }
      );

      expect(doesUsersHavePassword).toBe(false);
    });
  });

  describe("List user with a particular id", () => {
    it("should return 200 status code", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .get(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it("should return the user with the provided id", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .get(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.body.id).toBe(1);
    });

    it("should return 404 status code if user with the provided id does not exist", async () => {
      const response = await request(app)
        .get("/users/100")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(404);
    });

    it("should return 401 status code when user is unauthenticated", async () => {
      const response = await request(app).get(singleUserEndpoint).send();
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code when user is unauthorized", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .get(singleUserEndpoint)
        .set("Cookie", [`accessToken=${nonAdminToken};`])
        .send();
      expect(response.statusCode).toBe(403);
    });

    it("should not return user password in the response", async () => {
      await populateUsers(dataSource, numberOfUsersToPopulate);

      const response = await request(app)
        .get(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.body).not.toHaveProperty("password");
    });
  });
});
