import { NextFunction, Response } from "express";
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
}

export default TenantController;
