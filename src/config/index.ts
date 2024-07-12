import { config } from "dotenv";
config();

const { PORT, NODE_ENV } = process.env;

export const CONFIG = {
  PORT: PORT || 3000,
  NODE_ENV: NODE_ENV || "development"
};
