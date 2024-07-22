import { config } from "dotenv";
import path from "path";
import { z } from "zod";

config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  JWKS_URI: z.string().url(),
  PRIVATE_KEY: z.string()
});

const env = envSchema.parse(process.env);

export const CONFIG = {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  DB_HOST: env.DB_HOST,
  DB_PORT: env.DB_PORT,
  DB_USER: env.DB_USER,
  DB_PASSWORD: env.DB_PASSWORD,
  DB_NAME: env.DB_NAME,
  REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET,
  JWKS_URI: env.JWKS_URI,
  PRIVATE_KEY: env.PRIVATE_KEY
};
