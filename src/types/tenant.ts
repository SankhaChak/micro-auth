import { Request } from "express";

export interface TenantData {
  name: string;
  address: string;
}

export interface CreateTenantRequest extends Request {
  body: TenantData;
}
