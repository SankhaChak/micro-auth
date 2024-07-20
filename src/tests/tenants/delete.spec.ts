import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entity/Tenant";
import { UserRole } from "../../types/auth";
import { TenantData } from "../../types/tenant";

describe("DELETE /tenants/:id", () => {
  let dataSource: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let nonAdminAccessToken: string;

  const singleTenantEndpoint = "/tenants/1";

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5001");

    jwks.start();
    adminToken = jwks.token({
      sub: "1",
      role: UserRole.Admin
    });
    nonAdminAccessToken = jwks.token({
      sub: "2",
      role: UserRole.Customer
    });

    dataSource = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();

    const tenantsPayload: TenantData[] = Array.from(
      { length: 10 },
      (_, index) => ({
        name: `Tenant ${index}`,
        address: `Address ${index}`
      })
    );

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Tenant)
      .values(tenantsPayload)
      .execute();
  });

  afterAll(async () => {
    jwks.stop();
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe("Delete tenant with a particular id", () => {
    it("should return 204 status code", async () => {
      const response = await request(app)
        .delete(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(204);
    });

    it("should delete the tenant with the provided id", async () => {
      await request(app)
        .delete(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();

      const tenant = await dataSource.getRepository(Tenant).findOne({
        where: { id: 1 }
      });

      expect(tenant).toBeNull();
    });

    it("should only delete the tenant with the provided id", async () => {
      await request(app)
        .delete(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();

      const tenants = await dataSource.getRepository(Tenant).find();

      expect(tenants).toHaveLength(9);
    });

    it("should return 404 status code if tenant with the provided id does not exist", async () => {
      const response = await request(app)
        .delete("/tenants/100")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(404);
    });

    it("should return 401 status code if user is not authenticated", async () => {
      const response = await request(app).delete(singleTenantEndpoint).send();
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code if user is not admin", async () => {
      const response = await request(app)
        .delete(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${nonAdminAccessToken};`])
        .send();
      expect(response.statusCode).toBe(403);
    });
  });

  describe("Delete all tenants", () => {
    it("should return 204 status code", async () => {
      const response = await request(app)
        .delete("/tenants")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(204);
    });

    it("should delete all tenants", async () => {
      await request(app)
        .delete("/tenants")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();

      const tenants = await dataSource.getRepository(Tenant).find();

      expect(tenants).toHaveLength(0);
    });

    it("should return 401 status code if user is not authenticated", async () => {
      const response = await request(app).delete("/tenants").send();
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code if user is not admin", async () => {
      const response = await request(app)
        .delete("/tenants")
        .set("Cookie", [`accessToken=${nonAdminAccessToken};`])
        .send();
      expect(response.statusCode).toBe(403);
    });
  });
});
