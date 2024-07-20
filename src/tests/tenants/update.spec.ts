import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entity/Tenant";
import { UserRole } from "../../types/auth";
import { TenantData } from "../../types/tenant";

describe("PATCH /tenants/:id", () => {
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
    await dataSource.destroy();
  });

  describe("Update tenant with a particular id", () => {
    it("should return 200 status code", async () => {
      const response = await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({
          name: "Updated Tenant",
          address: "Updated Address"
        });
      expect(response.statusCode).toBe(200);
    });

    it("should update the tenant with the provided id", async () => {
      await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({
          name: "Updated Tenant",
          address: "Updated Address"
        });

      const updatedTenant = await dataSource.getRepository(Tenant).findOne({
        where: { id: 1 }
      });

      expect(updatedTenant?.name).toBe("Updated Tenant");
      expect(updatedTenant?.address).toBe("Updated Address");
    });

    it("should return 404 status code if tenant with the provided id does not exist", async () => {
      const response = await request(app)
        .patch("/tenants/100")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({
          name: "Updated Tenant",
          address: "Updated Address"
        });

      expect(response.statusCode).toBe(404);
    });

    it("should update only the provided fields", async () => {
      await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({
          name: "Updated Tenant"
        });

      const updatedTenant = await dataSource.getRepository(Tenant).findOne({
        where: { id: 1 }
      });

      expect(updatedTenant?.name).toBe("Updated Tenant");
      expect(updatedTenant?.address).toBe(`Address 0`);

      await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({
          address: "Updated Address"
        });

      const updatedTenant2 = await dataSource.getRepository(Tenant).findOne({
        where: { id: 1 }
      });

      expect(updatedTenant2?.name).toBe("Updated Tenant");
      expect(updatedTenant2?.address).toBe("Updated Address");
    });

    it("should only update the tenant with the provided id", async () => {
      await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({
          name: "Updated Tenant",
          address: "Updated Address"
        });

      const tenants = await dataSource.getRepository(Tenant).find();

      for (const tenant of tenants) {
        if (tenant.id === 1) {
          expect(tenant.name).toBe("Updated Tenant");
          expect(tenant.address).toBe("Updated Address");
        } else {
          expect(tenant.name).not.toBe("Updated Tenant");
          expect(tenant.address).not.toBe("Updated Address");
        }
      }
    });

    it("should return 400 status code if invalid fields are provided", async () => {
      const response = await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({
          invalidField: "Invalid Field"
        });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if no fields are provided", async () => {
      const response = await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${adminToken};`])
        .send({});

      expect(response.statusCode).toBe(400);
    });

    it("should return 401 status code if user is not authenticated", async () => {
      const response = await request(app).patch(singleTenantEndpoint).send({
        name: "Updated Tenant",
        address: "Updated Address"
      });
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code if user is not admin", async () => {
      const response = await request(app)
        .patch(singleTenantEndpoint)
        .set("Cookie", [`accessToken=${nonAdminAccessToken};`])
        .send({
          name: "Updated Tenant",
          address: "Updated Address"
        });

      expect(response.statusCode).toBe(403);
    });
  });
});
