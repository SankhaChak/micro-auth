import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);
  const errorStatusCode = err.status || 500;
  res.status(errorStatusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: req.path,
        location: ""
      }
    ]
  });
});

export default app;
