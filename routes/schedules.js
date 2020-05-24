const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const _ = require("lodash");
const {
  Tournament
} = require("../models/tournament");
const {
  User
} = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const moment = require("moment");

router.put("/", auth, validateAccess("teamleader"), async (req, res) => {
  for (const roundRequest of req.body) {
    const tournament = await Tournament.findById(roundRequest.tournamentID);
    if (!tournament) return res.status(400).send("No tournament found.");

    const round = tournament.rounds.id(roundRequest.round._id);
    if (!round) return res.status(400).send("No round found.");

    round.set({
      hosts: roundRequest.round.hosts,
      teamLeads: roundRequest.round.teamLeads,
      available: roundRequest.round.available
    });

    try {
      const {
        hosts,
        available,
        teamLeads
      } = roundRequest.round;
      const excluded = roundRequest.excluded;

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

      await tournament.save();
    } catch (ex) {
      console.error(ex);
      return res.status(500).send("Something failed.");
    }
  }

  return res.send(true);
});

router.get("/", auth, validateAccess("host"), async (req, res) => {
  const weekNumber = req.query.week || 0;
  const rangeStart = moment.utc().add(weekNumber, "weeks").startOf("isoWeek").toDate();
  const rangeEnd = moment.utc().add(weekNumber, "weeks").endOf("isoWeek").toDate();
  const aggregated = await Tournament
    .aggregate([{
        $match: {
          $and: [{
              endDate: {
                $gte: rangeStart
              }
            },
            {
              localStartDate: {
                $lte: rangeEnd
              }
            }
          ]

        }
      },
      {
        $unwind: "$rounds"
      },
      {
        $match: {
          $and: [{
            "rounds.localStartDate": {
              $lte: rangeEnd
            }
          }, {
            "rounds.localStartDate": {
              $gte: rangeStart
            }
          }]

        }
      },
      {
        $sort: {
          "rounds.startDate": 1
        }
      },
      {
        $addFields: {
          "rounds.tournamentName": "$name",
          "rounds.tournamentID": "$_id"
        }
      },
      {
        $group: {
          "_id": "$game",
          "rounds": {
            "$push": "$rounds"
          }
        }
      },
      {
        $project: {
          _id: 0,
          game: "$_id",
          rounds: 1
        }
      },
      {
        $sort: {
          game: 1
        }
      }
    ]);

  const rounds = await Tournament.populate(aggregated, {
    path: "rounds.hosts.host rounds.teamLeads.host rounds.available",
    select: "nickname roles"
  });

  rounds.forEach(gameObject => {
    const roundsDays = {};
    gameObject.rounds.forEach(round => {
      const date = moment.utc(round.localStartDate).format("YYYY-MM-DD");
      if (date in roundsDays) {
        roundsDays[date].push(round);
      } else {
        roundsDays[date] = new Array(round);
      }
    });

    gameObject.rounds = roundsDays;
  });

  return res.send(rounds);
});

module.exports = router;