import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entity/Tenant";
import { TenantData } from "../../types/tenant";

describe("GET /tenants & /tenant/:id", () => {
  let dataSource: DataSource;

  const tenantsEndpoint = "/tenants";
  const singleTenantEndpoint = "/tenants/1";

  beforeAll(async () => {
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
      const response = await request(app).get(singleTenantEndpoint).send();
      expect(response.statusCode).toBe(200);
    });

    it("should return the tenant with the provided id", async () => {
      const response = await request(app).get(singleTenantEndpoint).send();
      expect(response.body.id).toBe(1);
    });

    it("should return 404 status code if tenant with the provided id does not exist", async () => {
      const response = await request(app).get("/tenant/100").send();
      expect(response.statusCode).toBe(404);
    });
  });
});
