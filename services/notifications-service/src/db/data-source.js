require("reflect-metadata");
const { DataSource } = require("typeorm");
const { DATABASE_URL } = require("../config/env");
const ProcessedEvent = require("../entities/ProcessedEvent");

const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  entities: [ProcessedEvent],
  synchronize: true,
  logging: false,
});

module.exports = { AppDataSource };