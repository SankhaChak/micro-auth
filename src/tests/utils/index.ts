import { DataSource } from "typeorm";

export const truncateTables = async (dataSource: DataSource) => {
  const entities = dataSource.entityMetadatas;
  const clearEntityPromises = entities.map(async (entity) => {
    const repository = dataSource.getRepository(entity.name);
    return repository.clear();
  });
  await Promise.allSettled(clearEntityPromises);
};
