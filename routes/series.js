const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
  Series,
  validate
} = require("../models/series");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", auth, validateAccess("host"), async (req, res) => {
  const series = await Series.find();
  res.send(series);
});

router.get("/list", auth, validateAccess("host"), async (req, res) => {
  const series = await Series.find().select("name");
  res.send(series);
});

router.get("/:id", auth, validateObjectId, validateAccess("host"), async (req, res) => {
  const series = await Series.findById(req.params.id);
  if (!series) res.status(404).send("No series found.")

  res.send(series);
});

router.get("/:id/tournaments", auth, validateObjectId, validateAccess("host"), async (req, res) => {
  const series = await Series.findById(req.params.id).populate("tournaments", "name startDate endDate").sort("-endDate");
  if (!series) res.status(404).send("No series found.")

  res.send(series.tournaments);
});

router.delete("/:id", auth, validateObjectId, validateAccess("admin"), async (req, res) => {
  const series = await Series.findById(req.params.id);
  if (!series) return res.status(400).send("No series found.");

  await series.remove();
  res.send(series);
});

router.post("/", auth, validateAccess("admin"), async (req, res) => {
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const series = new Series(_.pick(req.body, ["name", "game", "startDate", "endDate", "recurrence", "region"]));
  await series.save();
  res.send(series);
});

router.put("/:id", auth, validateObjectId, validateAccess("admin"), async (req, res) => {
  const {
    error
  } = validate(_.pick(req.body, ["name", "game", "startDate", "endDate", "recurrence", "region"]));
  if (error) return res.status(400).send(error.details[0].message);

  const series = await Series.findById(req.params.id);
  if (!series) return res.status(400).send("No series found.");

  Object.assign(series, _.pick(req.body, ["name", "game", "startDate", "endDate", "recurrence", "region"]));
  await series.save();
  res.send(series);
});

module.exports = router;