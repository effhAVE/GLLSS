const winston = require("winston");
// require("winston-mongodb");
require("express-async-errors");

module.exports = function() {
  winston.exceptions.handle(
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true
    }),
    new winston.transports.File({
      filename: "uncaughtExceptions.log",
      handleExceptions: true
    }));

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  winston.add(new winston.transports.File({
    filename: "logfile.log"
  }));

  if (process.env.NODE_ENV !== "production") {
    winston.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }
}