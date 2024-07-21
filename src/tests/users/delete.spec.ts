import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { UserRole } from "../../types/auth";
import { populateTenants, populateUsers } from "../utils";

describe("DELETE /users/:id", () => {
  let dataSource: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let nonAdminToken: string;

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
    await populateUsers(dataSource, numberOfUsersToPopulate);
  });

  afterAll(async () => {
    jwks.stop();

    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe("Delete user", () => {
    it("should return 204 status code", async () => {
      const response = await request(app)
        .delete(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(204);
    });

    it("should delete the user with the provided id", async () => {
      await request(app)
        .delete(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();

      const response = await request(app)
        .get(singleUserEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(404);
    });

    it("should return 404 status code if user with the provided id does not exist", async () => {
      const response = await request(app)
        .delete("/users/100")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(404);
    });

    it("should return 403 status code if user is not an admin", async () => {
      const response = await request(app)
        .delete(singleUserEndpoint)
        .set("Cookie", [`accessToken=${nonAdminToken};`])
        .send();
      expect(response.statusCode).toBe(403);
    });

    it("should return 401 status code if user is unauthenticated", async () => {
      const response = await request(app).delete(singleUserEndpoint).send();
      expect(response.statusCode).toBe(401);
    });
  });
});
