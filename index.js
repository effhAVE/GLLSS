const winston = require("winston");
const express = require("express");
const app = express();
const history = require("connect-history-api-fallback");

require("./startup/logging")();
require("./startup/routes")(app);
app.use(history());
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/accountsExpiration")();
app.use("/", express.static("./client/dist"));
const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;
