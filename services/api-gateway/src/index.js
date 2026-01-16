const express = require("express");
const { makeClient } = require("../../libs/shared/httpClient");
const requestId = require("../../libs/shared/requestId");
const logger = require("../../libs/shared/logger");

const PORT = process.env.PORT || 8080;
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL;

const users = makeClient(USERS_SERVICE_URL);
const orders = makeClient(ORDERS_SERVICE_URL);

const app = express();
app.use(express.json());
app.use(requestId);

function forwardHeaders(req) {
  return { "x-request-id": req.requestId };
}

// health
app.get("/v2/health", async (req, res) => {
  res.json({ ok: true, service: "api-gateway", requestId: req.requestId });
});

// auth
app.post("/v2/auth/register", async (req, res) => {
  const r = await users.post("/auth/register", req.body, { headers: forwardHeaders(req) });
  res.status(r.status).json(r.data);
});

app.post("/v2/auth/login", async (req, res) => {
  const r = await users.post("/auth/login", req.body, { headers: forwardHeaders(req) });
  res.status(r.status).json(r.data);
});

// orders
app.post("/v2/orders", async (req, res) => {
  const r = await orders.post("/orders", req.body, { headers: forwardHeaders(req) });
  res.status(r.status).json(r.data);
});

app.get("/v2/orders", async (req, res) => {
  const r = await orders.get("/orders", { headers: forwardHeaders(req) });
  res.status(r.status).json(r.data);
});

app.use((err, req, res, next) => {
  logger.error("Gateway error", { requestId: req.requestId, err: String(err) });
  res.status(500).json({ error: "Internal error", requestId: req.requestId });
});

app.listen(PORT, () => logger.info("Gateway started", { port: PORT }));