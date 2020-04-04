const express = require("express");
const users = require("../routes/users");
const series = require("../routes/series");
const tournaments = require("../routes/tournaments");
const rounds = require("../routes/rounds");
const auth = require("../routes/auth");
const collections = require("../routes/collections");
const data = require("../routes/data");
const error = require("../middleware/error");
const cors = require("cors");

module.exports = function(app) {
  app.use(express.json());
  app.use(cors({
    exposedHeaders: ["x-auth-token"],
  }));
  app.use("/api/users", users);
  app.use("/api/series", series);
  app.use("/api/tournaments", tournaments);
  app.use("/api/tournaments/:id/rounds", rounds);
  app.use("/api/auth", auth);
  app.use("/api/collections", collections);
  app.use("/api/data", data);
  app.use(error);
}