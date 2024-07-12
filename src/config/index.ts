import { config } from "dotenv";
import path from "path";

config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const { PORT, NODE_ENV } = process.env;

export const CONFIG = {
  PORT: PORT || 3000,
  NODE_ENV: NODE_ENV || "development",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: +process.env.DB_PORT! || 5432,
  DB_USER: process.env.DB_USER || "test",
  DB_PASSWORD: process.env.DB_PASSWORD || "test",
  DB_NAME: process.env.DB_NAME || "test"
};
