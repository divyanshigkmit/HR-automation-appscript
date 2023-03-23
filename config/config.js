require("dotenv").config({
  path: `${__dirname}/../.env`,
});

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
    define: {
      underscored: true,
    },
  },

  test: {
    username: "root",
    password: null,
    database: "database_development",
    host: "127.0.0.1",
    dialect: "postgres",
  },

  production: {
    username: process.env.PRODUCTION_USERNAME,
    password: process.env.PRODUCTION_PASSWORD,
    database: process.env.PRODUCTION_DATABASE,
    host: process.env.PRODUCTION_HOST,
    dialect: "postgres",
  },
  refereshSecretKey: process.env.REFERESH_SECRET_KEY,
  accessSecretKey: process.env.ACCCESS_SECRET_KEY,
};
