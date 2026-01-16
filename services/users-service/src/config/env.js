function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

module.exports = {
  PORT: Number(process.env.PORT || 3001),
  DATABASE_URL: must("DATABASE_URL"),
  JWT_ACCESS_SECRET: must("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: must("JWT_REFRESH_SECRET"),
};