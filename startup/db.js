const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function() {
  const db = process.env.DB || config.get("db");
  mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    })
    .then(() => winston.info(`Connected to ${db}...`));
}