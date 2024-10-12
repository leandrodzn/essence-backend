const { Sequelize, Op } = require("sequelize");
require("./sequelize-extras");

let config = {
  username: process.env.EC_DATABASE_USERNAME,
  password: process.env.EC_DATABASE_PASSWORD,
  database: process.env.EC_DATABASE_NAME,
  host: process.env.EC_DATABASE_HOST,
  port: process.env.EC_DATABASE_PORT,
  dialect: "mysql",
  logging: process.env.EC_DATABASE_LOGGING === "true",
};

const sequelize = new Sequelize(config);

module.exports = sequelize;
