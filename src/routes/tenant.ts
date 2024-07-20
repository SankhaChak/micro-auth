import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import TenantController from "../controllers/TenantController";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entity/Tenant";
import authenticateMiddleware from "../middlewares/authenticate";
import canAccess from "../middlewares/canAccess";
import TenantService from "../services/TenantService";
import { UserRole } from "../types/auth";
import createTenantValidator from "../validators/tenant-validator";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

router.post(
  "/",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  createTenantValidator,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.createTenant(req, res, next)
);

export default router;
