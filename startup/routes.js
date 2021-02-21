const express = require("express");
const users = require("../routes/users");
const series = require("../routes/series");
const tournaments = require("../routes/tournaments");
const rounds = require("../routes/rounds");
const auth = require("../routes/auth");
const collections = require("../routes/collections");
const data = require("../routes/data");
const schedules = require("../routes/schedules");
const gameaccounts = require("../routes/gameaccounts");
const accountcodes = require("../routes/accountcodes");
const articles = require("../routes/articles");
const roles = require("../routes/roles");
const logs = require("../routes/logs");
const error = require("../middleware/error");
const cors = require("cors");

module.exports = function (app) {
  app.use(express.json({ limit: "8mb" }));
  app.use(
    cors({
      exposedHeaders: ["x-auth-token", "Date"]
    })
  );
  app.use("/api/users", users);
  app.use("/api/series", series);
  app.use("/api/tournaments", tournaments);
  app.use("/api/tournaments/:id/rounds", rounds);
  app.use("/api/auth", auth);
  app.use("/api/collections", collections);
  app.use("/api/data", data);
  app.use("/api/schedules", schedules);
  app.use("/api/accounts", gameaccounts);
  app.use("/api/codes", accountcodes);
  app.use("/api/articles", articles);
  app.use("/api/roles", roles);
  app.use("/api/logs", logs);
  app.use(error);
};
