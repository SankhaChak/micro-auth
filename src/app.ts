import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import "reflect-metadata";
import logger from "./config/logger";
import authRouter from "./routes/auth";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(express.json());
app.use("/auth", authRouter);

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
