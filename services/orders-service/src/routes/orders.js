const express = require("express");
const logger = require("../../../libs/shared/logger");
const { AppDataSource } = require("../db/data-source");
const Order = require("../entities/Order");
const OrderItem = require("../entities/OrderItem");
const OutboxEvent = require("../entities/OutboxEvent");

const router = express.Router();

// create order
router.post("/", async (req, res) => {
  const requestId = req.headers["x-request-id"] || null;
  const { userId, items } = req.body || {};

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "userId and items[] required", requestId });
  }

  // items: [{ productId, qty, price }]
  const orderRepo = AppDataSource.getRepository(Order);
  const outboxRepo = AppDataSource.getRepository(OutboxEvent);

  let total = 0;
  const orderItems = items.map((i) => {
    total += Number(i.price) * Number(i.qty);
    const oi = new OrderItem();
    oi.productId = i.productId;
    oi.qty = Number(i.qty);
    oi.price = Number(i.price);
    return oi;
  });

  const order = orderRepo.create({
    userId,
    status: "CREATED",
    totalPrice: total,
    items: orderItems,
  });

  // Outbox pattern in a transaction
  await AppDataSource.transaction(async (trx) => {
    const saved = await trx.getRepository(Order).save(order);

    const event = trx.getRepository(OutboxEvent).create({
      aggregateId: saved.id,
      type: "OrderCreated",
      payload: { orderId: saved.id, userId: saved.userId, totalPrice: saved.totalPrice },
      status: "NEW",
    });

    await trx.getRepository(OutboxEvent).save(event);
  });

  logger.info("Order created + outbox event", { requestId });
  res.status(201).json({ ok: true, requestId });
});

router.get("/", async (req, res) => {
  const requestId = req.headers["x-request-id"] || null;
  const repo = AppDataSource.getRepository(Order);
  const orders = await repo.find({ order: { createdAt: "DESC" }, relations: { items: true } });
  res.json({ orders, requestId });
});

module.exports = router;