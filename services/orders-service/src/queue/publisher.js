const amqplib = require("amqplib");
const logger = require("../../../libs/shared/logger");
const { RABBITMQ_URL } = require("../config/env");

const EXCHANGE = "events";
const ROUTING_KEY = "orders.events";

let conn;
let ch;

async function initRabbit() {
  conn = await amqplib.connect(RABBITMQ_URL);
  ch = await conn.createChannel();
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });

  // queues for notifications service (declare here or in consumer; ok either way)
  await ch.assertQueue("notifications.q", { durable: true, deadLetterExchange: "dlx" });
  await ch.bindQueue("notifications.q", EXCHANGE, ROUTING_KEY);

  // retry + DLQ infra
  await ch.assertExchange("dlx", "direct", { durable: true });
  await ch.assertQueue("notifications.dlq", { durable: true });
  await ch.bindQueue("notifications.dlq", "dlx", "notifications.dlq");

  await ch.assertQueue("notifications.retry.5s", {
    durable: true,
    messageTtl: 5000,
    deadLetterExchange: EXCHANGE,
    deadLetterRoutingKey: ROUTING_KEY,
  });

  logger.info("Rabbit initialized (publisher)");
}

function publishEvent({ eventId, type, payload, requestId }) {
  const msg = Buffer.from(JSON.stringify({ eventId, type, payload, requestId, ts: new Date().toISOString() }));
  ch.publish(EXCHANGE, ROUTING_KEY, msg, {
    persistent: true,
    messageId: eventId,
    contentType: "application/json",
  });
}

async function closeRabbit() {
  try { await ch?.close(); } catch {}
  try { await conn?.close(); } catch {}
}

module.exports = { initRabbit, publishEvent, closeRabbit };