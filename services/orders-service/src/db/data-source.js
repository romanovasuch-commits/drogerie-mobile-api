require("reflect-metadata");
const { DataSource } = require("typeorm");
const { DATABASE_URL } = require("../config/env");
const Order = require("../entities/Order");
const OrderItem = require("../entities/OrderItem");
const OutboxEvent = require("../entities/OutboxEvent");

const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  entities: [Order, OrderItem, OutboxEvent],
  synchronize: true,
  logging: false,
});

module.exports = { AppDataSource };