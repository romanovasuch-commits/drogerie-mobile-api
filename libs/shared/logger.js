function log(level, msg, meta = {}) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta,
  };
  console.log(JSON.stringify(line));
}

module.exports = {
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};