import createHttpError from "http-errors";
import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { TenantData } from "../types/tenant";

class TenantService {
  private tenantRepository: Repository<Tenant>;

  constructor(tenantRepository: Repository<Tenant>) {
    this.tenantRepository = tenantRepository;
  }

  async create(params: TenantData) {
    try {
      const tenant = await this.tenantRepository.save({
        name: params.name,
        address: params.address
      });

      return tenant;
    } catch (err) {
      const error = createHttpError(500, "Failed to create new tenant");
      throw error;
    }
  }

  async getAll() {
    try {
      const allTenants = await this.tenantRepository.find();
      return allTenants;
    } catch (err) {
      const error = createHttpError(500, "Failed to fetch tenants");
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: { id: +id }
      });

      if (!tenant) {
        const error = createHttpError(404, "Tenant not found");
        throw error;
      }

      return tenant;
    } catch (err) {
      if (err instanceof createHttpError.HttpError) {
        throw err;
      }

      const error = createHttpError(500, "Failed to fetch tenant");
      throw error;
    }
  }
}

export default TenantService;
