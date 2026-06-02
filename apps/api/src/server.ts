import { app } from "./app";
import { env } from "./config/env";

const server = app.listen(env.API_PORT, "0.0.0.0", () => {
  console.info(`API listening on http://0.0.0.0:${env.API_PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
