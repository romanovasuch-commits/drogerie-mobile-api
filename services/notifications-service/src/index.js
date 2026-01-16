const express = require("express");
const logger = require("../../libs/shared/logger");
const { PORT } = require("./config/env");
const { AppDataSource } = require("./db/data-source");
const { initConsumer, startConsuming, closeConsumer } = require("./queue/consumer");

const app = express();

app.get("/health", async (req, res) => {
  res.json({ ok: true, service: "notifications-service" });
});

async function bootstrap() {
  await AppDataSource.initialize();
  await initConsumer();
  await startConsuming();

  const server = app.listen(PORT, () => logger.info("Notifications service started", { port: PORT }));

  process.on("SIGTERM", async () => {
    logger.warn("SIGTERM received");
    server.close();
    await closeConsumer();
    process.exit(0);
  });
}

bootstrap().catch((e) => {
  logger.error("Bootstrap failed", { err: String(e) });
  process.exit(1);
});