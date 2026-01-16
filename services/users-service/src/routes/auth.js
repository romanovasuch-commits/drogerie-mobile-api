const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../../../libs/shared/logger");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require("../config/env");
const User = require("../entities/User");
const { AppDataSource } = require("../db/data-source");

const router = express.Router();

router.post("/register", async (req, res) => {
  const requestId = req.headers["x-request-id"];
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required", requestId });

  const repo = AppDataSource.getRepository(User);
  const exists = await repo.findOne({ where: { email } });
  if (exists) return res.status(409).json({ error: "email already exists", requestId });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = repo.create({ email, passwordHash, role: "user" });
  await repo.save(user);

  logger.info("User registered", { requestId, userId: user.id });
  res.status(201).json({ id: user.id, email: user.email, requestId });
});

router.post("/login", async (req, res) => {
  const requestId = req.headers["x-request-id"];
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required", requestId });

  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: "invalid credentials", requestId });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials", requestId });

  const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

  res.json({ accessToken, refreshToken, requestId });
});

module.exports = router;