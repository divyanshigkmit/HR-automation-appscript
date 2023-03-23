require("dotenv").config();

const schedulers = require("./schedulers");
const { sequelize } = require("./models");
const app = require("./app");

const startServer = async function () {
  try {
    await sequelize.authenticate();
    console.log("... Database ✔");

    schedulers.start();
    console.log("... Schedulers ✔");

    app.listen(process.env.SERVER_PORT);
    console.log(`--- Server started on ${process.env.SERVER_PORT} ---\n\n`);
  } catch (err) {
    console.log("server setup failed", err);
    console.log("Error: ", err.message);
  }
};

startServer();
