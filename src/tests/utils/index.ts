import { DataSource } from "typeorm";
import { Tenant } from "../../entity/Tenant";
import { User } from "../../entity/User";
import { UserRole } from "../../types/auth";

export const truncateTables = async (dataSource: DataSource) => {
  const entities = dataSource.entityMetadatas;
  const clearEntityPromises = entities.map(async (entity) => {
    const repository = dataSource.getRepository(entity.name);
    return repository.clear();
  });
  await Promise.allSettled(clearEntityPromises);
};

export const isJwt = (token: string): boolean => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  try {
    parts.forEach((part) => Buffer.from(part, "base64").toString("utf-8"));
  } catch (error) {
    return false;
  }

  return true;
};

export const extractAuthTokensFromCookies = (cookies: string[]) => {
  let accessToken: string = "";
  let refreshToken: string = "";

  cookies.forEach((cookie) => {
    if (cookie.includes("accessToken")) {
      accessToken = cookie.split(";")[0].split("=")[1];
    }

    if (cookie.includes("refreshToken")) {
      refreshToken = cookie.split(";")[0].split("=")[1];
    }
  });

  return { accessToken, refreshToken };
};

export const populateTenants = async (
  dataSource: DataSource,
  quantity = 10
) => {
  const tenantsPayload = Array.from({ length: quantity }, (_, index) => ({
    name: `Tenant ${index}`,
    address: `Address ${index}`
  }));

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Tenant)
    .values(tenantsPayload)
    .execute();

  return tenantsPayload;
};

export const populateUsers = async (dataSource: DataSource, quantity = 10) => {
  const usersPayload = Array.from({ length: quantity }, (_, index) => ({
    firstName: `User ${index}`,
    lastName: `User ${index}`,
    email: `randomemail${index}@gmail.com`,
    password: "passwordSecret",
    role: Math.random() > 0.5 ? UserRole.Manager : UserRole.Customer,
    tenantId: 1
  }));

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(usersPayload)
    .execute();

  return usersPayload;
};
