const winston = require("winston");
const express = require("express");
const morgan = require("morgan");
const app = express();
const history = require("connect-history-api-fallback");
require("tls").DEFAULT_ECDH_CURVE = "auto";
const { routesLogger } = require("./startup/routeslogging");
morgan.token("user", function (req, res) {
  if (req.user) {
    return req.user._id;
  } else {
    return "null";
  }
});

require("./startup/logging")();
app.use(
  morgan(":method :url :user :status - :response-time ms", {
    skip: function (req, res) {
      return !["POST", "PUT", "DELETE"].includes(req.method);
    },
    stream: routesLogger.stream
  })
);
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
