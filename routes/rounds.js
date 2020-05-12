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
        console.error(error);
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
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");
  res.send(round);
});

router.delete("/:rid", auth, validateAccess("admin"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");
  const otherRounds = tournament.rounds.filter(roundObject => roundObject._id !== round._id);

  [round.hosts, round.teamLeads].forEach(array => {
    for (const hostObject of array) {
      (async function() {
        for (const round of otherRounds) {
          if (round.hosts.some(host => host.host.equals(hostObject.host)) || round.teamLeads.some(TL => TL.host.equals(hostObject.host))) return;
        }

        await User.findByIdAndUpdate(hostObject.host, {
            "$pull": {
              "tournamentsHosted": tournament._id
            }
          }, {
            new: true
          })
          .exec((error, data) => data);
      })();
    };
  });

  await round.remove();
  await tournament.save();

  res.send(round);
});

router.put("/:rid", auth, validateAccess("teamleader"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");

  const excluded = req.body.excluded;
  if (!excluded) return res.status(400).send("Missing 'excluded' field!");
  const {
    error
  } = validate(_.pick(req.body.round, ["name", "startDate", "endDate", "bestOf", "prepTime", "hosts", "teamLeads", "available"]));
  if (error) return res.status(400).send(error.details[0].message);

  round.set({
    name: req.body.round.name,
    startDate: req.body.round.startDate,
    endDate: req.body.round.endDate,
    hosts: req.body.round.hosts,
    teamLeads: req.body.round.teamLeads,
    available: req.body.round.available,
    bestOf: req.body.round.bestOf,
    prepTime: req.body.round.prepTime
  });

  try {
    const {
      hosts,
      available,
      teamLeads
    } = req.body.round;
    if (Array.isArray(hosts) && Array.isArray(available) && Array.isArray(teamLeads) && Array.isArray(excluded)) {
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

    excluded.forEach(async hostObject => {
      for (const round of tournament.rounds) {
        if (round.hosts.some(hostObj => hostObj.host.equals(hostObject._id)) || round.teamLeads.some(TLObject => TLObject.host.equals(hostObject._id))) return;
      }
      await User.findByIdAndUpdate(hostObject, {
          "$pull": {
            "tournamentsHosted": tournament._id
          }
        }, {
          new: true
        })
        .exec((error, data) => data);
    });

    tournament.rounds.sort((a, b) => a.startDate - b.startDate);
    tournament.startDate = tournament.rounds[0].startDate;
    tournament.endDate = tournament.rounds[tournament.rounds.length - 1].endDate;
    await tournament.save();
    res.send(round);
  } catch (ex) {
    console.error(ex);
    res.status(500).send("Something failed.");
  }
});

router.put("/", auth, validateAccess("teamleader"), validateObjectId, async (req, res) => {
  for (const roundRequest of req.body) {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(400).send("No tournament found.");

    const round = tournament.rounds.id(roundRequest.round._id);
    if (!round) return res.status(400).send("No round found.");

    const excluded = roundRequest.excluded;
    if (!excluded) return res.status(400).send("Missing 'excluded' field!");
    const {
      error
    } = validate(_.pick(roundRequest.round, ["name", "startDate", "endDate", "bestOf", "prepTime", "hosts", "teamLeads", "available"]));
    if (error) return res.status(400).send(error.details[0].message);

    round.set({
      name: roundRequest.round.name,
      startDate: roundRequest.round.startDate,
      endDate: roundRequest.round.endDate,
      hosts: roundRequest.round.hosts,
      teamLeads: roundRequest.round.teamLeads,
      available: roundRequest.round.available,
      bestOf: roundRequest.round.bestOf,
      prepTime: roundRequest.round.prepTime
    });

    try {
      const {
        hosts,
        available,
        teamLeads
      } = roundRequest.round;
      if (Array.isArray(hosts) && Array.isArray(available) && Array.isArray(teamLeads) && Array.isArray(excluded)) {
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

      excluded.forEach(async hostObject => {
        for (const round of tournament.rounds) {
          if (round.hosts.some(hostObj => hostObj.host.equals(hostObject._id)) || round.teamLeads.some(TLObject => TLObject.host.equals(hostObject._id))) return;
        }
        await User.findByIdAndUpdate(hostObject, {
            "$pull": {
              "tournamentsHosted": tournament._id
            }
          }, {
            new: true
          })
          .exec((error, data) => data);
      });

      tournament.rounds.sort((a, b) => a.startDate - b.startDate);
      tournament.startDate = tournament.rounds[0].startDate;
      tournament.endDate = tournament.rounds[tournament.rounds.length - 1].endDate;
      await tournament.save();
    } catch (ex) {
      console.error(ex);
      return res.status(500).send("Something failed.");
    }
  }

  res.send(true);

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

router.post("/:rid/ready", auth, validateAccess("host"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).select("rounds");
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");

  let host;
  if (req.body.source === "host") {
    host = round.hosts.find(hostObj => hostObj.host.equals(req.user._id));
  } else {
    host = round.teamLeads.find(hostObj => hostObj.host.equals(req.user._id));
  }

  if (host) {
    host.ready = true;
    await tournament.save();
    return res.send(true);
  }

  return res.status(400).send("No host found.")
});

module.exports = router;