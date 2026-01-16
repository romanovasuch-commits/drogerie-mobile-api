function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
module.exports = {
  PORT: Number(process.env.PORT || 3002),
  DATABASE_URL: must("DATABASE_URL"),
  REDIS_URL: must("REDIS_URL"),
  RABBITMQ_URL: must("RABBITMQ_URL"),
};