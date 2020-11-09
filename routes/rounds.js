const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const validateObjectId = require("../middleware/validateObjectId");
const hasPermission = require("../helpers/hasPermission");
const _ = require("lodash");
const { Round, validate } = require("../models/round");
const { Tournament } = require("../models/tournament");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const moment = require("moment");
const express = require("express");
const router = express.Router({
  mergeParams: true
});
const winston = require("winston");

router.post("/", auth, validateAccess("rounds.create"), validateObjectId, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Tournament.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        rounds: {
          $each: [new Round(_.pick(req.body, ["name", "startDate", "endDate", "bestOf", "prepTime"]))],
          $sort: {
            startDate: 1
          }
        }
      }
    },
    {
      new: true
    }
  ).exec(async (error, data) => {
    if (error) {
      winston.error(error);
      return res.status(500).send("Something failed.");
    } else {
      data.startDate = data.rounds[0].startDate;
      data.endDate = data.rounds[data.rounds.length - 1].endDate;
      await data.save();
      return res.send(data);
    }
  });
});

router.get("/", auth, validateAccess("rounds.view"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate({
    path: "rounds.hosts rounds.teamLeads",
    select: "name"
  });
  if (!tournament) return res.status(400).send("No tournament found.");

  return res.send(tournament.rounds);
});

router.get("/:rid", auth, validateAccess("rounds.view"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");
  return res.send(round);
});

router.delete("/:rid", auth, validateAccess("rounds.delete"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");
  const otherRounds = tournament.rounds.filter(roundObject => roundObject._id !== round._id);

  [round.hosts, round.teamLeads].forEach(array => {
    for (const hostObject of array) {
      (async function () {
        for (const round of otherRounds) {
          if (round.hosts.some(host => host.host.equals(hostObject.host)) || round.teamLeads.some(TL => TL.host.equals(hostObject.host))) return;
        }

        await User.findByIdAndUpdate(
          hostObject.host,
          {
            $pull: {
              tournamentsHosted: tournament._id
            }
          },
          {
            new: true
          }
        ).exec((error, data) => data);
      })();
    }
  });

  await round.remove();
  if (tournament.rounds.length) {
    tournament.rounds.sort((a, b) => a.startDate - b.startDate);
    tournament.startDate = tournament.rounds[0].startDate;
    tournament.endDate = tournament.rounds[tournament.rounds.length - 1].endDate;
  }

  await tournament.save();

  return res.send(round);
});

router.put("/:rid", auth, validateAccess("rounds.update"), validateObjectId, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");

  const excluded = hasPermission(req.user, [`teamLeads.add`, `teamLeads.remove`, `hosts.add`, `hosts.remove`]) ? req.body.excluded : [];
  if (!excluded) return res.status(400).send("Missing 'excluded' field!");
  const { error } = validate(_.pick(req.body.round, ["name", "startDate", "endDate", "bestOf", "prepTime", "hosts", "teamLeads", "available"]));
  if (error) return res.status(400).send(error.details[0].message);

  const updateObject = {};

  for (let [key, value] of Object.entries(req.body.round)) {
    if (
      hasPermission(req.user, `roundsProps.${key}`) ||
      (key === "hosts" && hasPermission(req.user, `hosts.add`)) ||
      (key === "teamLeads" && hasPermission(req.user, `teamLeads.add`)) ||
      (key === "available" && hasPermission(req.user, [`teamLeads.add`, `teamLeads.remove`, `hosts.add`, `hosts.remove`]))
    ) {
      updateObject[key] = value;
    } else if (key === "startDate" || (key === "endDate" && hasPermission(req.user, `roundsProps.dates`))) {
      if (key === "startDate") updateObject.startDate = value;
      if (key === "endDate") updateObject.endDate = value;
    }
  }

  round.set(updateObject);

  try {
    const { hosts, available, teamLeads } = req.body.round;
    if (Array.isArray(hosts) && Array.isArray(available) && Array.isArray(teamLeads) && Array.isArray(excluded)) {
      [hosts, teamLeads].forEach(array => {
        if (array.some(hostObject => typeof hostObject.host === "undefined")) return res.status(400).send("Bad request.");
      });
    } else {
      return res.status(400).send("Bad request.");
    }

    [round.hosts, round.teamLeads].forEach(array => {
      array.forEach(async hostObject => {
        await User.findByIdAndUpdate(
          hostObject.host,
          {
            $addToSet: {
              tournamentsHosted: tournament._id
            }
          },
          {
            new: true
          }
        ).exec((error, data) => data);
      });
    });

    excluded.forEach(async hostObject => {
      for (const round of tournament.rounds) {
        if (
          round.hosts.some(hostObj => hostObj.host.equals(hostObject._id)) ||
          round.teamLeads.some(TLObject => TLObject.host.equals(hostObject._id))
        )
          return;
      }
      await User.findByIdAndUpdate(
        hostObject,
        {
          $pull: {
            tournamentsHosted: tournament._id
          }
        },
        {
          new: true
        }
      ).exec((error, data) => data);
    });

    tournament.rounds.sort((a, b) => a.startDate - b.startDate);
    tournament.startDate = tournament.rounds[0].startDate;
    tournament.endDate = tournament.rounds[tournament.rounds.length - 1].endDate;
    await tournament.save();
    return res.send(round);
  } catch (ex) {
    winston.error(ex);
    return res.status(500).send("Something failed.");
  }
});

router.put("/", auth, validateAccess("rounds.update"), validateObjectId, async (req, res) => {
  for (const roundRequest of req.body) {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(400).send("No tournament found.");

    const round = tournament.rounds.id(roundRequest.round._id);
    if (!round) return res.status(400).send("No round found.");

    const excluded = hasPermission(req.user, [`teamLeads.add`, `teamLeads.remove`, `hosts.add`, `hosts.remove`]) ? roundRequest.excluded : [];
    if (!excluded) return res.status(400).send("Missing 'excluded' field!");
    const { error } = validate(_.pick(roundRequest.round, ["name", "startDate", "endDate", "bestOf", "prepTime", "hosts", "teamLeads", "available"]));
    if (error) return res.status(400).send(error.details[0].message);

    const updateObject = {};

    for (let [key, value] of Object.entries(roundRequest.round)) {
      if (
        hasPermission(req.user, `roundsProps.${key}`) ||
        (key === "hosts" && hasPermission(req.user, `hosts.add`)) ||
        (key === "teamLeads" && hasPermission(req.user, `teamLeads.add`)) ||
        (key === "available" && hasPermission(req.user, [`teamLeads.add`, `teamLeads.remove`, `hosts.add`, `hosts.remove`]))
      ) {
        updateObject[key] = value;
      } else if (key === "startDate" || (key === "endDate" && hasPermission(req.user, `roundsProps.dates`))) {
        if (key === "startDate") updateObject.startDate = value;
        if (key === "endDate") updateObject.endDate = value;
      }
    }

    round.set(updateObject);

    try {
      const { hosts, available, teamLeads } = roundRequest.round;
      if (Array.isArray(hosts) && Array.isArray(available) && Array.isArray(teamLeads) && Array.isArray(excluded)) {
        [hosts, teamLeads].forEach(array => {
          if (array.some(hostObject => typeof hostObject.host === "undefined")) return res.status(400).send("Bad request.");
        });
      } else {
        return res.status(400).send("Bad request.");
      }

      [round.hosts, round.teamLeads].forEach(array => {
        array.forEach(async hostObject => {
          await User.findByIdAndUpdate(
            hostObject.host,
            {
              $addToSet: {
                tournamentsHosted: tournament._id
              }
            },
            {
              new: true
            }
          ).exec((error, data) => data);
        });
      });

      excluded.forEach(async hostObject => {
        for (const round of tournament.rounds) {
          if (
            round.hosts.some(hostObj => hostObj.host.equals(hostObject._id)) ||
            round.teamLeads.some(TLObject => TLObject.host.equals(hostObject._id))
          )
            return;
        }
        await User.findByIdAndUpdate(
          hostObject,
          {
            $pull: {
              tournamentsHosted: tournament._id
            }
          },
          {
            new: true
          }
        ).exec((error, data) => data);
      });

      tournament.rounds.sort((a, b) => a.startDate - b.startDate);
      tournament.startDate = tournament.rounds[0].startDate;
      tournament.endDate = tournament.rounds[tournament.rounds.length - 1].endDate;
      await tournament.save();
    } catch (ex) {
      winston.error(ex);
      return res.status(500).send("Something failed.");
    }
  }

  return res.send(true);
});

router.put("/:rid/availability", auth, validateAccess("hosting.fillAvailability"), validateObjectId, async (req, res) => {
  const value = req.body.value;
  const id = req.user._id;
  if (typeof value === "undefined" || typeof id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Bad request");
  }

  const tournament = await Tournament.findById(req.params.id).select("rounds");
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");
  if (value === true) {
    round.available.push(id);
  } else {
    round.available = round.available.filter(user => {
      return !user.equals(id);
    });
  }

  await tournament.save();
  return res.send(round);
});

router.post("/:rid/ready", auth, validateAccess(["hosting.canHost", "hosting.canLead"]), validateObjectId, async (req, res) => {
  const source = req.body.source;
  if (!source) return res.status(400).send("Bad request.");
  const tournament = await Tournament.findById(req.params.id).select("rounds");
  if (!tournament) return res.status(400).send("No tournament found.");

  const round = tournament.rounds.id(req.params.rid);
  if (!round) return res.status(400).send("No round found.");

  const roundIndex = tournament.rounds.findIndex(tournamentRound => tournamentRound._id === round._id);
  for (const [index, upcomingRound] of tournament.rounds.slice(roundIndex).entries()) {
    let host;
    if (source === "host") {
      host = upcomingRound.hosts.find(hostObj => hostObj.host.equals(req.user._id));
    } else {
      host = upcomingRound.teamLeads.find(hostObj => hostObj.host.equals(req.user._id));
    }

    const nextRound = tournament.rounds[roundIndex + index + 1];
    if (host) {
      host.ready = true;
    }

    if (nextRound) {
      if (!(moment(nextRound.startDate).diff(upcomingRound.endDate, "minutes") <= 60 && host)) {
        break;
      }
    }
  }

  await tournament.save();
  return res.send(true);
});

module.exports = router;
