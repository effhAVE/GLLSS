const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
  Round
} = require("../models/round");
const {
  Tournament
} = require("../models/tournament");
const {
  User
} = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router({
  mergeParams: true
});

router.post("/", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  if (!req.body.name) return res.status(400).send("Bad request.");

  Tournament.findByIdAndUpdate(req.params.id, {
      "$push": {
        "rounds": {
          "$each": [new Round(_.pick(req.body, ["name", "startDate", "endDate", "bestOf", "TLValue"]))],
          "$sort": {
            "startDate": 1
          }
        }
      }
    }, {
      new: true
    })
    .exec(async (error, data) => {
      console.log(req.body);
      if (error) {
        console.log(error);
        return res.status(500).send("Something failed.");
      } else {
        data.startDate = data.rounds[0].startDate;
        data.endDate = data.rounds[data.rounds.length - 1].endDate;
        await data.save();
        return res.send(data);
      }
    });
});

router.get("/", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate({
    path: "rounds.hosts",
    select: "name"
  });
  if (!tournament) return res.status(400).send("No tournament found.");

  res.send(tournament.rounds);
});

router.get("/:rid", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate({
    path: "rounds.hosts",
    select: "name"
  });
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");
  res.send(round);
});


router.put("/:rid/availability", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).select("rounds");
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");
  if (req.body.value === true) {
    round.available.push(req.body.id)
  } else {
    round.available = round.available.filter(id => {
      return !id.equals(req.body.id);
    });
  }

  await tournament.save();
  res.send(round);
});

router.put("/", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  if (!Array.isArray(req.body)) {
    return res.status(400).send("Bad request.");
  }

  tournament.rounds = req.body;
  let tournamentHosts = [];
  tournament.rounds.forEach(round => {
    round.hosts.forEach(host => {
      if (!tournamentHosts.includes(host)) tournamentHosts.push(host);
    });
  });

  try {
    tournamentHosts.forEach(async hostID => {
      await User.findByIdAndUpdate(hostID, {
        "$addToSet": {
          "tournamentsHosted": tournament._id
        }
      }, {
        new: true
      });
    });

    tournament.startDate = tournament.rounds[0].startDate;
    tournament.endDate = tournament.rounds[rounds.length - 1].endDate;

    await tournament.save();
    res.send(tournament);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.put("/:rid", auth, validateAccess("teamleader"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");

  round.set({
    name: req.body.name,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    hosts: req.body.hosts,
    teamLeads: req.body.teamLeads,
    available: req.body.available,
    bestOf: req.body.bestOf,
    TLValue: req.body.TLValue
  });

  try {
    const {
      hosts,
      available,
      teamLeads
    } = req.body;
    if (Array.isArray(hosts) && Array.isArray(available) && Array.isArray(teamLeads)) {
      [hosts, teamLeads].forEach(array => {
        if (array.some(hostObject => typeof hostObject.host === "undefined")) return res.status(400).send("Bad request.");
      })

      round.hosts = hosts;
      round.available = available;
      round.teamLeads = teamLeads;
    } else {
      return res.status(400).send("Bad request.");
    }

    [round.hosts, round.teamLeads].forEach(array => {
      array.forEach(async hostObject => {
        await User.findByIdAndUpdate(hostObject.host, {
            "$addToSet": {
              "tournamentsHosted": tournament._id
            }
          }, {
            new: true
          })
          .exec((error, data) => data);
      });
    });

    await tournament.save();
    res.send(round);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

module.exports = router;