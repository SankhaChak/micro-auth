import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entity/Tenant";
import { TenantData } from "../../types/tenant";

describe("POST /tenants", () => {
  let dataSource: DataSource;
  const endpoint = "/tenants";
  const tenantData: TenantData = {
    name: "Test Tenant",
    address: "Test Address"
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
    it("should return 201 status code", async () => {
      const response = await request(app).post(endpoint).send(tenantData);
      expect(response.statusCode).toBe(201);
    });

    it("should add tenant to database", async () => {
      await request(app).post(endpoint).send(tenantData);

      const tenant = await dataSource.getRepository(Tenant).find();

      expect(tenant).toHaveLength(1);
      expect(tenant[0].name).toBe(tenantData.name);
      expect(tenant[0].address).toBe(tenantData.address);
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 if name is missing", async () => {
      const data = { ...tenantData } as Partial<TenantData>;
      delete data.name;

      const response = await request(app).post(endpoint).send(data);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if name is missing", async () => {
      const data = { ...tenantData } as Partial<TenantData>;
      delete data.address;

      const response = await request(app).post(endpoint).send(data);
      expect(response.statusCode).toBe(400);
    });
  });
});
