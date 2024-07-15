import winston from "winston";
import { CONFIG } from ".";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-service"
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
    // winston.format.colorize()
  ),
  transports: [
    new winston.transports.File({
      dirname: "logs",
      filename: "app.log",
      level: "info",
      silent: CONFIG.NODE_ENV === "test"
    }),
    new winston.transports.Console({
      silent: CONFIG.NODE_ENV === "test"
    })
  ]
});

export default logger;
