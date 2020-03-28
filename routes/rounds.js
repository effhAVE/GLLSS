const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
  Round,
  validate
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
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Tournament.findByIdAndUpdate(req.params.id, {
      "$push": {
        "rounds": {
          "$each": [new Round(_.pick(req.body, ["name", "startDate", "endDate", "bestOf", "prepTime"]))],
          "$sort": {
            "startDate": 1
          }
        }
      }
    }, {
      new: true
    })
    .exec(async (error, data) => {
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

router.delete("/:rid", auth, validateAccess("teamleader"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");

  await round.remove();
  await tournament.save();

  res.send(round);
});

router.put("/:rid", auth, validateAccess("teamleader"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");

  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  round.set({
    name: req.body.name,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    hosts: req.body.hosts,
    teamLeads: req.body.teamLeads,
    available: req.body.available,
    bestOf: req.body.bestOf,
    prepTime: req.body.prepTime
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

module.exports = router;