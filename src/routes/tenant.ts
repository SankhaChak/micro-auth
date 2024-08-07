import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import TenantController from "../controllers/TenantController";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entity/Tenant";
import authenticateMiddleware from "../middlewares/authenticate";
import canAccess from "../middlewares/canAccess";
import TenantService from "../services/TenantService";
import { UserRole } from "../types/auth";
import createTenantValidator, {
  updateTenantValidator
} from "../validators/tenant-validator";

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

router.get("/", (req: Request, res: Response, next: NextFunction) =>
  tenantController.getTenants(req, res, next)
);

router.get(
  "/:id",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getTenant(req, res, next)
);

router.patch(
  "/:id",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  updateTenantValidator,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.updateTenant(req, res, next)
);

router.delete(
  "/",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.deleteAllTenants(req, res, next)
);

router.delete(
  "/:id",
  authenticateMiddleware,
  canAccess([UserRole.Admin]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.deleteTenant(req, res, next)
);

export default router;
