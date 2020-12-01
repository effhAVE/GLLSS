const winston = require("winston");

module.exports = function (err, req, res, next) {
  winston.log({ level: "error", message: err });
  console.log(err);
  res.status(500).send("Something failed.");
};
