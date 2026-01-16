require("reflect-metadata");
const { DataSource } = require("typeorm");
const { DATABASE_URL } = require("../config/env");
const User = require("../entities/User");

const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  entities: [User],
  synchronize: true, // для pet-проекта ок; в проде миграции
  logging: false
});

module.exports = { AppDataSource };