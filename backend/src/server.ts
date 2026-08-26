import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = createApp();
const server = app.listen(config.PORT, () => {
  console.info("SOVA backend listening", { port: config.PORT });
});

function shutdown(signal: string) {
  console.info("SOVA backend shutting down", { signal });
  server.close(() => {
    app.locals.close?.();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
