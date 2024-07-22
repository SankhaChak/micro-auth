import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { CONFIG } from "./config";

const isProduction = CONFIG.NODE_ENV === "production";
const baseDir = isProduction ? "dist/src" : "src";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: CONFIG.DB_HOST,
  port: CONFIG.DB_PORT,
  username: CONFIG.DB_USER,
  password: CONFIG.DB_PASSWORD,
  database: CONFIG.DB_NAME,
  // synchronize: CONFIG.NODE_ENV === "production" ? false : true,
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, `../${baseDir}/entity/*.{js,ts}`)],
  migrations: [path.join(__dirname, `../${baseDir}/migration/*.{js,ts}`)],
  subscribers: []
});
