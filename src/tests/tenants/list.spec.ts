import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entity/Tenant";
import { UserRole } from "../../types/auth";
import { TenantData } from "../../types/tenant";

describe("GET /tenants & /tenant/:id", () => {
  let dataSource: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let nonAdminAccessToken: string;

  const tenantsEndpoint = "/tenants";
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
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe("List all tenants", () => {
    it("should return 200 status code", async () => {
      const response = await request(app).get(tenantsEndpoint).send();
      expect(response.statusCode).toBe(200);
    });

    it("should return a list of tenants", async () => {
      const response = await request(app).get(tenantsEndpoint).send();
      expect(response.body).toHaveLength(10);
    });
  });

  describe("List tenant with a particular id", () => {
    it("should return 200 status code", async () => {
      const response = await request(app)
        .get(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it("should return the tenant with the provided id", async () => {
      const response = await request(app)
        .get(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.body.id).toBe(1);
    });

    it("should return 404 status code if tenant with the provided id does not exist", async () => {
      const response = await request(app)
        .get("/tenant/100")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(404);
    });

    it("should return 403 status code if user is not an admin", async () => {
      const response = await request(app)
        .get(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${nonAdminAccessToken};`])
        .send();
      expect(response.statusCode).toBe(403);
    });

    it("should return 401 status code if user is not authenticated", async () => {
      const response = await request(app).get(singleTenantEndpoint).send();
      expect(response.statusCode).toBe(401);
    });
  });
});
