const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
  Tournament,
  validate
} = require("../models/tournament");
const {
  Series
} = require("../models/series");
const {
  User
} = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const moment = require("moment");


router.get("/", auth, validateAccess("host"), async (req, res) => {
  const tournaments = await Tournament.find({
      "endDate": {
        $gte: new Date()
      }
    })
    .sort("startDate");

  res.send(tournaments);
});

router.get("/past", auth, validateAccess("host"), async (req, res) => {
  const limitSize = +req.query.limit || 10;
  const page = +req.query.page || 0;
  const tournaments = await Tournament.find({
      "endDate": {
        $lt: new Date()
      }
    })
    .sort("-endDate")
    .limit(limitSize)
    .skip(limitSize * page);

  res.send(tournaments);
});

router.get("/hosted", auth, validateAccess("host"), async (req, res) => {
  const user = await User.findById(req.user._id).select("tournamentsHosted -_id").populate({
    path: "tournamentsHosted",
    select: "name startDate endDate",
    match: {
      "endDate": {
        $gte: new Date()
      }
    }
  }).sort("tournamentsHosted.startDate");
  res.send(user.tournamentsHosted);
});

router.get("/:id", auth, validateObjectId, validateAccess("host"), async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate("rounds.hosts.host rounds.teamLeads.host rounds.available", "nickname roles");
  if (!tournament) return res.status(400).send("No tournament found.");
  const isPast = moment(tournament.endDate).isBefore(new Date());
  res.send({
    tournament,
    isPast
  });
});

router.put("/:id", auth, validateObjectId, validateAccess("admin"), async (req, res) => {
  const {
    error
  } = validate(_.pick(req.body, ["name", "series", "game", "startDate", "endDate", "region"]));
  if (error) return res.status(400).send(error.details[0].message);
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  Object.assign(tournament, _.pick(req.body, ["name", "game", "startDate", "endDate", "region"]));
  await tournament.save();
  res.send(tournament);
});

router.delete("/:id", auth, validateObjectId, validateAccess("admin"), async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");
  User.update({
      tournamentsHosted: tournament._id
    }, {
      "$pull": {
        "tournamentsHosted": tournament._id
      }
    },
    (error, data) => data);

  Series.update({
    tournaments: tournament._id
  }, {
    "$pull": {
      "tournaments": tournament._id
    }
  }, (error, data) => data);

  await tournament.remove();
  res.send(tournament);
});

router.post("/", auth, validateAccess("admin"), async (req, res) => {
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let tournament = new Tournament(_.pick(req.body, ["name", "series", "game", "startDate", "endDate", "region"]));
  let series;
  if (tournament.series) {
    series = await Series.findById(tournament.series);
    if (!series) return res.status(400).send("No series with the given ID.");
    if (series.recurrence === "daily") {
      tournament.name = `#${moment(tournament.startDate).week()} ${moment(tournament.startDate).format("ddd")} ${series.name}`;
    } else if (series.recurrence === "weekly") {
      tournament.name = `#${moment(tournament.startDate).week()} ${series.name}`;
    }

    tournament.game = series.game;
    tournament.region = series.region;
  }

  try {
    const savedTournament = await tournament.save();
    if (savedTournament.series !== null) {
      series.tournaments.push(savedTournament._id);
      await series.save();
    }

    res.send(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while saving.");
  }
});

module.exports = router;