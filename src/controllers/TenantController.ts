import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import TenantService from "../services/TenantService";
import { CreateTenantRequest } from "../types/tenant";

class TenantController {
  private tenantService: TenantService;

  private logger: Logger;

  constructor(tenantService: TenantService, logger: Logger) {
    this.tenantService = tenantService;
    this.logger = logger;
  }

  async createTenant(
    req: CreateTenantRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const rqBody = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      const tenant = await this.tenantService.create(rqBody);

      return res.status(201).json({ id: tenant.id });
    } catch (err) {
      this.logger.error(err);
      return next(err);
    }
  }

  async getTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.getAll();

      return res.status(200).json(tenants);
    } catch (err) {
      this.logger.error(err);
      return next(err);
    }
  }

  async getTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const tenant = await this.tenantService.getById(id);

      return res.status(200).json(tenant);
    } catch (err) {
      this.logger.error(err);
      return next(err);
    }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const rqBody = req.body;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        const error = createHttpError(400, result.array());
        throw error;
      }

      const tenant = await this.tenantService.update(id, rqBody);

      return res.status(200).json(tenant);
    } catch (error) {
      this.logger.error(error);
      return next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await this.tenantService.delete(id);

      return res.status(204).send();
    } catch (error) {
      this.logger.error(error);
      return next(error);
    }
  }

  async deleteAllTenants(req: Request, res: Response, next: NextFunction) {
    try {
      await this.tenantService.deleteAll();

      return res.status(204).send();
    } catch (error) {
      this.logger.error(error);
      return next(error);
    }
  }
}

export default TenantController;
