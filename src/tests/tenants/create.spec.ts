import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entity/Tenant";
import { UserRole } from "../../types/auth";
import { TenantData } from "../../types/tenant";

describe("POST /tenants", () => {
  let dataSource: DataSource;
  const endpoint = "/tenants";
  const tenantData: TenantData = {
    name: "Test Tenant",
    address: "Test Address"
  };
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5001");
    dataSource = await AppDataSource.initialize();

    jwks.start();
    adminToken = jwks.token({
      sub: "test-user",
      role: UserRole.Admin
    });
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("All fields provided", () => {
    it("should return 201 status code", async () => {
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(tenantData);
      expect(response.statusCode).toBe(201);
    });

    it("should add tenant to database", async () => {
      await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(tenantData);

      const tenant = await dataSource.getRepository(Tenant).find();

      expect(tenant).toHaveLength(1);
      expect(tenant[0].name).toBe(tenantData.name);
      expect(tenant[0].address).toBe(tenantData.address);
    });

    it("should return 401 status code if user is not authenticated", async () => {
      const response = await request(app).post(endpoint).send(tenantData);
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code if user is not authenticated", async () => {
      const customerAccessToken = jwks.token({
        sub: "test-user",
        role: UserRole.Customer
      });
      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${customerAccessToken};`])
        .send(tenantData);

      const tenantsInDb = await dataSource.getRepository(Tenant).find();

      expect(response.statusCode).toBe(403);
      expect(tenantsInDb).toHaveLength(0);
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 if name is missing", async () => {
      const data = { ...tenantData } as Partial<TenantData>;
      delete data.name;

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(data);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if name is missing", async () => {
      const data = { ...tenantData } as Partial<TenantData>;
      delete data.address;

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(data);
      expect(response.statusCode).toBe(400);
    });
  });
});
