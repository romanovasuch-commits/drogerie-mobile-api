const { createClient } = require("redis");
const { REDIS_URL } = require("../config/env");
const logger = require("../../../libs/shared/logger");

const redis = createClient({ url: REDIS_URL });

redis.on("error", (e) => logger.error("Redis error", { err: String(e) }));

async function connectRedis() {
  if (!redis.isOpen) await redis.connect();
  return redis;
}

module.exports = { redis, connectRedis };