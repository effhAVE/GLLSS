const mongoose = require("mongoose");
const config = require("config");
const winston = require("winston");
require("winston-mongodb");
const logger = winston.createLogger({
  format: winston.format.printf((info) =>
    info.message
  ),
  transports: [
    new winston.transports.MongoDB({
      db: config.get("db"),
      collection: "routesLog",
      // expire after a month
      expireAfterSeconds: 60 * 60 * 24 * 30,
      tryReconnect: true
    })
  ]
});

logger.stream = {
  write: function(message, encoding) {
    const [method, url, userID, status] = message.split(" ");
    logger.log({
      level: "info",
      message: message,
      metadata: {
        method,
        url,
        userID,
        status
      }
    });
  }
};

module.exports.routesLogger = logger;