require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    timezone: '-04:00',
    seederStorage: "sequelize",
    seederStorageTableName: "sequelize_data",
    logging: false
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    timezone: '-04:00',
    seederStorage: "sequelize",
    seederStorageTableName: "sequelize_data",
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    timezone: '-04:00',
    seederStorage: "sequelize",
    seederStorageTableName: "sequelize_data",
    logging: false
  }
}