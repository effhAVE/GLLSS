const express = require("express");
const users = require("../routes/users");
const tournaments = require("../routes/tournaments");
const rounds = require("../routes/rounds");
const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/tournaments", tournaments);
  app.use("/api/tournaments/:id/rounds", rounds);
  app.use("/api/auth", auth);
  app.use(error);
}