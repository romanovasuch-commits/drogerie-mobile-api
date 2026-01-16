const amqplib = require("amqplib");
const logger = require("../../../libs/shared/logger");
const { RABBITMQ_URL } = require("../config/env");
const { AppDataSource } = require("../db/data-source");
const ProcessedEvent = require("../entities/ProcessedEvent");

const QUEUE = "notifications.q";

let conn;
let ch;

async function initConsumer() {
  conn = await amqplib.connect(RABBITMQ_URL);
  ch = await conn.createChannel();

  await ch.prefetch(10);

  // ensure queues exist (mirror setup from publisher)
  await ch.assertQueue(QUEUE, { durable: true, deadLetterExchange: "dlx" });
  await ch.assertExchange("dlx", "direct", { durable: true });
  await ch.assertQueue("notifications.dlq", { durable: true });
  await ch.bindQueue("notifications.dlq", "dlx", "notifications.dlq");

  await ch.assertQueue("notifications.retry.5s", {
    durable: true,
    messageTtl: 5000,
    deadLetterExchange: "events",
    deadLetterRoutingKey: "orders.events",
  });

  logger.info("Consumer ready");
}

async function handleMessage(msg) {
  const raw = msg.content.toString("utf-8");
  const data = JSON.parse(raw);
  const eventId = data.eventId || msg.properties.messageId;

  const repo = AppDataSource.getRepository(ProcessedEvent);

  // idempotency
  const exists = await repo.findOne({ where: { eventId } });
  if (exists) {
    logger.warn("Duplicate event ignored", { eventId });
    ch.ack(msg);
    return;
  }

  // simulate occasional failure to demonstrate retry/DLQ (remove later)
  if (Math.random() < 0.1) throw new Error("Random fail to demo retry");

  // "send notification"
  logger.info("Notify user", { eventId, type: data.type, payload: data.payload });

  await repo.save({ eventId });
  ch.ack(msg);
}

async function startConsuming() {
  await ch.consume(QUEUE, async (msg) => {
    if (!msg) return;
    try {
      await handleMessage(msg);
    } catch (err) {
      const retries = Number(msg.properties.headers?.["x-retries"] || 0);

      logger.error("Message failed", { err: String(err), retries });

      if (retries < 3) {
        // send to retry queue with incremented header
        ch.sendToQueue("notifications.retry.5s", msg.content, {
          persistent: true,
          headers: { ...(msg.properties.headers || {}), "x-retries": retries + 1 },
          messageId: msg.properties.messageId,
          contentType: msg.properties.contentType,
        });
        ch.ack(msg);
      } else {
        // to DLQ
        ch.publish("dlx", "notifications.dlq", msg.content, {
          persistent: true,
          headers: msg.properties.headers,
          messageId: msg.properties.messageId,
          contentType: msg.properties.contentType,
        });
        ch.ack(msg);
      }
    }
  });
}

async function closeConsumer() {
  try { await ch?.close(); } catch {}
  try { await conn?.close(); } catch {}
}

module.exports = { initConsumer, startConsuming, closeConsumer };