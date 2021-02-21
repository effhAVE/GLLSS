const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const { Series, validate } = require("../models/series");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const routesLogger = require("../helpers/routesLogger");

function seriesCustomSort(series) {
  const seriesCopy = Array.from(series);
  const sortMap = {
    daily: 1,
    weekly: 2,
    none: 3
  };

  return seriesCopy.sort((a, b) =>
    a.game === b.game
      ? a.recurrence === b.recurrence
        ? a.name.localeCompare(b.name)
        : sortMap[a.recurrence] - sortMap[b.recurrence]
      : a.game.localeCompare(b.game)
  );
}

router.get("/", auth, validateAccess("series.view"), async (req, res) => {
  const series = await Series.find({});

  const sortedSeries = seriesCustomSort(series);
  return res.send(sortedSeries);
});

router.get("/list", auth, validateAccess("series.view"), async (req, res) => {
  const series = await Series.find().select("name game recurrence");
  const sortedSeries = seriesCustomSort(series);

  return res.send(sortedSeries);
});

router.get("/:id", auth, validateObjectId, validateAccess("series.view"), async (req, res) => {
  const series = await Series.findById(req.params.id);
  if (!series) return res.status(404).send("No series found.");

  return res.send(series);
});

router.get("/:id/tournaments", auth, validateObjectId, validateAccess("series.view"), async (req, res) => {
  const limitSize = +req.query.limit || 10;
  const page = +req.query.page || 0;
  const series = await Series.findById(req.params.id).populate({
    path: "tournaments",
    options: {
      limit: limitSize,
      sort: {
        endDate: -1
      },
      skip: limitSize * page
    }
  });
  if (!series) return res.status(404).send("No series found.");
  return res.send(series.tournaments);
});

router.delete("/:id", auth, validateObjectId, validateAccess("series.delete"), async (req, res) => {
  const series = await Series.findById(req.params.id);
  if (!series) return res.status(400).send("No series found.");

  await series.remove();
  routesLogger({
    type: "deleted",
    documentType: "series",
    documentID: series._id,
    user: { nickname: req.user.nickname, _id: req.user._id },
    description: `${series.name} was deleted.`
  });

  return res.send(series);
});

router.post("/", auth, validateAccess("series.create"), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const series = new Series(_.pick(req.body, ["name", "game", "startDate", "endDate", "recurrence", "region"]));
  await series.save();
  routesLogger({
    type: "created",
    documentType: "series",
    documentID: series._id,
    user: { nickname: req.user.nickname, _id: req.user._id },
    description: `${series.name} was created.`
  });

  return res.send(series);
});

router.put("/:id", auth, validateObjectId, validateAccess("series.update"), async (req, res) => {
  const { error } = validate(_.pick(req.body, ["name", "game", "startDate", "endDate", "recurrence", "region"]));
  if (error) return res.status(400).send(error.details[0].message);

  const series = await Series.findById(req.params.id);
  if (!series) return res.status(400).send("No series found.");

  Object.assign(series, _.pick(req.body, ["name", "game", "startDate", "endDate", "recurrence", "region"]));
  await series.save();
  routesLogger({
    type: "deleted",
    documentType: "series",
    documentID: series._id,
    user: { nickname: req.user.nickname, _id: req.user._id },
    description: `${series.name}'s settings were changed.`
  });

  return res.send(series);
});

module.exports = router;
