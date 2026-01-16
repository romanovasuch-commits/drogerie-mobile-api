const express = require("express");
const requestId = require("../../libs/shared/requestId");
const logger = require("../../libs/shared/logger");
const { PORT } = require("./config/env");
const { AppDataSource } = require("./db/data-source");
const { connectRedis } = require("./redis/client");
const { initRabbit, publishEvent, closeRabbit } = require("./queue/publisher");
const OutboxEvent = require("./entities/OutboxEvent");
const ordersRoutes = require("./routes/orders");

const app = express();
app.use(express.json());
app.use(requestId);

app.get("/health", async (req, res) => {
  res.json({ ok: true, service: "orders-service", requestId: req.requestId });
});

app.use("/orders", ordersRoutes);

// Simple outbox poller (для pet-проекта — ок)
async function startOutboxPublisher() {
  const repo = AppDataSource.getRepository(OutboxEvent);

  setInterval(async () => {
    try {
      const batch = await repo.find({ where: { status: "NEW" }, take: 20, order: { createdAt: "ASC" } });
      for (const e of batch) {
        try {
          publishEvent({ eventId: e.id, type: e.type, payload: e.payload, requestId: null });
          e.status = "PUBLISHED";
          await repo.save(e);
        } catch (err) {
          e.status = "FAILED";
          await repo.save(e);
          logger.error("Publish failed", { err: String(err), eventId: e.id });
        }
      }
    } catch (err) {
      logger.error("Outbox poll error", { err: String(err) });
    }
  }, 1000);
}

app.use((err, req, res, next) => {
  logger.error("Orders service error", { requestId: req.requestId, err: String(err) });
  res.status(500).json({ error: "Internal error", requestId: req.requestId });
});

async function bootstrap() {
  await AppDataSource.initialize();
  await connectRedis();
  await initRabbit();
  await startOutboxPublisher();

  const server = app.listen(PORT, () => logger.info("Orders service started", { port: PORT }));

  // graceful shutdown
  process.on("SIGTERM", async () => {
    logger.warn("SIGTERM received");
    server.close();
    await closeRabbit();
    process.exit(0);
  });
}

bootstrap().catch((e) => {
  logger.error("Bootstrap failed", { err: String(e) });
  process.exit(1);
});