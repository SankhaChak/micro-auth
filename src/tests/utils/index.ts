import { DataSource } from "typeorm";

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
