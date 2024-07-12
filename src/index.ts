import app from "./app";
import { CONFIG } from "./config";

const startServer = async () => {
  const port = CONFIG.PORT;

  try {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log("🚀 ~ file: index.ts:13 ~ startServer ~ error:", error);
    process.exit(1);
  }
};

startServer();
