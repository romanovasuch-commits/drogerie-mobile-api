const express = require("express");
const requestId = require("../../libs/shared/requestId");
const logger = require("../../libs/shared/logger");
const { PORT } = require("./config/env");
const { AppDataSource } = require("./db/data-source");
const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());
app.use(requestId);

app.get("/health", async (req, res) => {
  res.json({ ok: true, service: "users-service", requestId: req.requestId });
});

app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  logger.error("Users service error", { requestId: req.requestId, err: String(err) });
  res.status(500).json({ error: "Internal error", requestId: req.requestId });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => logger.info("Users service started", { port: PORT }));
  })
  .catch((e) => {
    logger.error("DB init failed", { err: String(e) });
    process.exit(1);
  });