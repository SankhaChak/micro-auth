import app from "./app";
import { CONFIG } from "./config";
import logger from "./config/logger";

const startServer = async () => {
  const port = CONFIG.PORT;

  try {
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("🚀 ~ file: index.ts:13 ~ startServer ~ error:", error);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

startServer();
