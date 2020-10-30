const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const propsFilter = require("../middleware/propsFilter");
const _ = require("lodash");
const { Tournament, validate } = require("../models/tournament");
const { Round } = require("../models/round");
const { Series } = require("../models/series");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const tournamentRegions = require("../collections/regions");

router.get("/", auth, validateAccess("tournaments.view"), async (req, res) => {
  const limitSize = +req.query.limit || 10;
  const page = +req.query.page || 0;
  const searchQuery = req.query.search || "";
  const gamesQuery = req.query.games.split(",") || [];
  const regionsQuery = req.query.regions.split(",") || [];

  let gameFilter = {
    $exists: true
  };

  let regionFilter = {
    $exists: true
  };

  if (gamesQuery[0]) {
    gameFilter = {
      $in: gamesQuery
    };
  }

  if (regionsQuery[0]) {
    regionFilter = {
      $in: regionsQuery
    };
  }

  const tournaments = await Tournament.find({
    endDate: {
      $gte: new Date()
    },
    name: new RegExp(searchQuery, "i"),
    game: gameFilter,
    region: regionFilter
  })
    .sort({
      startDate: 1,
      endDate: 1
    })
    .limit(limitSize)
    .skip(limitSize * page);

  return res.send(tournaments);
});

router.get("/past", auth, validateAccess("tournaments.view"), async (req, res) => {
  const limitSize = +req.query.limit || 10;
  const page = +req.query.page || 0;
  const searchQuery = req.query.search || "";
  const gamesQuery = req.query.games.split(",") || [];
  const regionsQuery = req.query.regions.split(",") || [];

  let gameFilter = {
    $exists: true
  };

  let regionFilter = {
    $exists: true
  };

  if (gamesQuery[0]) {
    gameFilter = {
      $in: gamesQuery
    };
  }

  if (regionsQuery[0]) {
    regionFilter = {
      $in: regionsQuery
    };
  }

  const tournaments = await Tournament.find({
    endDate: {
      $lt: new Date()
    },
    name: new RegExp(searchQuery, "i"),
    game: gameFilter,
    region: regionFilter
  })
    .sort({
      endDate: -1,
      startDate: -1
    })
    .limit(limitSize)
    .skip(limitSize * page);

  return res.send(tournaments);
});

router.get("/hosted/past", auth, validateAccess("tournaments.view"), async (req, res) => {
  const limitSize = +req.query.limit || 5;
  const page = +req.query.page || 0;
  const type = req.query.type;
  const gamesQuery = req.query.games.split(",") || [];
  const regionsQuery = req.query.regions.split(",") || [];

  let gameFilter = {
    $exists: true
  };

  let regionFilter = {
    $exists: true
  };

  if (gamesQuery[0]) {
    gameFilter = {
      $in: gamesQuery
    };
  }

  if (regionsQuery[0]) {
    regionFilter = {
      $in: regionsQuery
    };
  }

  const user = await User.findById(req.user._id)
    .select("tournamentsHosted -_id")
    .populate({
      path: "tournamentsHosted",
      match: {
        endDate: {
          $lt: new Date()
        },
        game: gameFilter,
        region: regionFilter
      },
      options: {
        limit: limitSize,
        skip: limitSize * page,
        sort: "-endDate"
      },
      select: "name region startDate endDate game rounds"
    });

  if (type) {
    user.tournamentsHosted.forEach(tournament => {
      tournament.rounds = tournament.rounds.filter(round => {
        const host = round.hosts.find(hostObject => hostObject.host.equals(req.user._id));
        const lead = round.teamLeads.find(TLObject => TLObject.host.equals(req.user._id));
        if (host) {
          if (type === "lost") return host.lostHosting;
          if (type === "hosted") return !host.lostHosting;
        } else if (lead) {
          if (type === "lost") return lead.lostLeading;
          if (type === "hosted") return !lead.lostLeading;
        }

        return host || lead;
      });
    });

    user.tournamentsHosted = user.tournamentsHosted.filter(tournament => tournament.rounds.length);
  }

  return res.send(user.tournamentsHosted);
});

router.get("/hosted", auth, validateAccess("tournaments.view"), async (req, res) => {
  const limitSize = +req.query.limit || 5;
  const showPastRounds = req.query.showPast === "true" || false;
  const page = +req.query.page || 0;

  const user = await User.findById(req.user._id)
    .select("tournamentsHosted -_id")
    .populate({
      path: "tournamentsHosted",
      match: {
        endDate: {
          $gte: new Date()
        }
      },
      options: {
        sort: "startDate"
      },
      select: "name region startDate endDate game rounds"
    });

  user.tournamentsHosted.forEach(tournament => {
    tournament.rounds = tournament.rounds.filter(round => {
      if (!showPastRounds && moment(round.endDate).isSameOrBefore(new Date())) return false;
      const host = round.hosts.find(hostObject => hostObject.host.equals(req.user._id));
      const lead = round.teamLeads.find(TLObject => TLObject.host.equals(req.user._id));
      return host || lead;
    });
  });

  user.tournamentsHosted = user.tournamentsHosted.filter(tournament => tournament.rounds.length);
  user.tournamentsHosted.sort((a, b) => {
    if (!b.rounds[0]) console.log(b.name);
    if (!a.rounds[0]) console.log(a.name);
    return a.rounds[0].startDate - b.rounds[0].startDate;
  });

  return res.send(user.tournamentsHosted.slice(page * limitSize, page * limitSize + limitSize));
});

router.get("/:id", auth, validateObjectId, validateAccess("tournaments.view"), async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate("rounds.hosts.host rounds.teamLeads.host rounds.available", "nickname roles");
  if (!tournament) return res.status(400).send("No tournament found.");
  tournament.rounds.forEach(round => {
    round.available.sort((a, b) => a.nickname.localeCompare(b.nickname));
  });
  const isPast = moment(tournament.endDate).isBefore(new Date());
  return res.send({
    tournament,
    isPast
  });
});

router.put("/:id", auth, validateObjectId, validateAccess("tournaments.update"), propsFilter("tournamentsProps"), async (req, res) => {
  const { error } = validate(_.pick(req.body, ["name", "series", "game", "startDate", "endDate", "region", "countedByRounds", "gllURL"]));
  if (error) return res.status(400).send(error.details[0].message);
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  Tournament.findOneAndUpdate({ _id: req.params.id }, req.body.filteredProps, { new: true }, (err, tournament) => {
    return err ? res.send(err) : res.send(tournament);
  });
});

router.delete("/:id", auth, validateObjectId, validateAccess("tournaments.delete"), async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");
  User.update(
    {
      tournamentsHosted: tournament._id
    },
    {
      $pull: {
        tournamentsHosted: tournament._id
      }
    },
    (error, data) => data
  );

  Series.update(
    {
      tournaments: tournament._id
    },
    {
      $pull: {
        tournaments: tournament._id
      }
    },
    (error, data) => data
  );

  await tournament.remove();
  return res.send(tournament);
});

router.post("/", auth, validateAccess("tournaments.create"), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let tournament = new Tournament(
    _.pick(req.body, ["name", "series", "game", "startDate", "endDate", "region", "countedByRounds", "gllURL", "rounds"])
  );
  let series;
  if (tournament.series) {
    series = await Series.findById(tournament.series);
    if (!series) return res.status(400).send("No series with the given ID.");
    if (series.region && series.recurrence !== "none") {
      tournament.region = series.region;
    }

    const regionObject = tournamentRegions.find(region => region.name === tournament.region);
    const localStartDate = moment(tournament.startDate).add(regionObject.offset, "hours").format();

    if (series.recurrence === "daily") {
      tournament.name = `#${moment(localStartDate).isoWeek()} ${moment(localStartDate).format("ddd")} ${series.name}`;
    } else if (series.recurrence === "weekly") {
      tournament.name = `#${moment(localStartDate).isoWeek()} ${series.name}`;
    }

    tournament.game = series.game;
  }

  if (tournament.rounds.length) {
    const dbRoundsArray = [];
    for (const round of tournament.rounds) {
      dbRoundsArray.push(new Round(_.pick(round, ["name", "startDate", "endDate", "bestOf", "prepTime"])));
    }

    tournament.rounds = dbRoundsArray;
  }

  try {
    const savedTournament = await tournament.save();
    if (savedTournament.series !== null) {
      series.tournaments.push(savedTournament._id);
      await series.save();
    }

    return res.send(tournament);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error while saving.");
  }
});

module.exports = router;
