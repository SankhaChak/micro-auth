import "reflect-metadata";
import { DataSource } from "typeorm";
import { CONFIG } from "./config";
import { RefreshToken } from "./entity/RefreshToken";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: CONFIG.DB_HOST,
  port: CONFIG.DB_PORT,
  username: CONFIG.DB_USER,
  password: CONFIG.DB_PASSWORD,
  database: CONFIG.DB_NAME,
  // synchronize: CONFIG.NODE_ENV === "production" ? false : true,
  synchronize: CONFIG.NODE_ENV === "dev",
  logging: false,
  entities: [User, RefreshToken],
  migrations: [],
  subscribers: []
});
