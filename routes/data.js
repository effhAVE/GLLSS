const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const moment = require("moment");
const {
  Tournament
} = require("../models/tournament");
const {
  Data
} = require("../models/data");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const logDir = "dataLogs";
const sortKeysRecursive = require('sort-keys-recursive');
const gridfs = require('gridfs-stream');
const schedule = require("node-schedule");
const dataCalculation = require("../helpers/dataCalculation");
gridfs.mongo = mongoose.mongo;
const connection = mongoose.connection;
let gfs;
connection.once('open', function() {
  gfs = gridfs(connection.db);
});

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

schedule.scheduleJob("0 * * * *", async () => {
  const gameValues = await getRecentGameValues();
  const date = moment().format("YYYY-MM");

  console.log(`Recalculated values for ${date} with following game values: ${gameValues}`);
  await dataCalculation(date, gameValues, 100);
});

async function getRecentGameValues() {
  const data = await Data.findOne().sort("-updatedAt").select("calculation.gameValues");
  return data.calculation.gameValues;
}

router.get("/schedule", auth, validateAccess("teamleader"), async (req, res) => {
  const weekNumber = req.query.week || 0;
  const previousWeekStart = moment().add(weekNumber - 1, "weeks").startOf("isoWeek").toDate();
  const previousWeekEnd = moment().add(weekNumber - 1, "weeks").endOf("isoWeek").toDate();
  const currentWeekStart = moment().add(weekNumber, "weeks").startOf("isoWeek").toDate();
  const currentWeekEnd = moment().add(weekNumber, "weeks").endOf("isoWeek").toDate();

  const balanceCalculation = {
    total: {}
  };
  const gameValues = await getRecentGameValues();

  const previousWeekAggregated = await Tournament.aggregate([{
      $match: {
        "endDate": {
          $gte: previousWeekStart
        },
        "localStartDate": {
          $lte: previousWeekEnd
        },
        countedByRounds: true
      }
    },
    {
      $unwind: "$rounds"
    },
    {
      $match: {
        "rounds.localStartDate": {
          $gte: previousWeekStart
        }
      }
    },
    {
      $group: {
        _id: "$_id",
        game: {
          $first: "$game"
        },
        name: {
          $first: "$name"
        },
        rounds: {
          $push: "$rounds"
        }
      }
    }
  ]);

  const currentWeekAggregated = await Tournament.aggregate([{
      $match: {
        "endDate": {
          $gte: currentWeekStart
        },
        "localStartDate": {
          $lte: currentWeekEnd
        },
        countedByRounds: true
      }
    },
    {
      $unwind: "$rounds"
    },
    {
      $match: {
        "rounds.localStartDate": {
          $gte: currentWeekStart
        }
      }
    },
    {
      $group: {
        _id: "$_id",
        game: {
          $first: "$game"
        },
        name: {
          $first: "$name"
        },
        rounds: {
          $push: "$rounds"
        }
      }
    }
  ]);

  const previousWeekTournaments = await Tournament.populate(previousWeekAggregated, {
    path: "rounds.hosts.host rounds.teamLeads.host rounds.available",
    select: "nickname roles"
  });

  const currentWeekTournaments = await Tournament.populate(currentWeekAggregated, {
    path: "rounds.hosts.host rounds.teamLeads.host rounds.available",
    select: "nickname roles"
  });

  previousWeekTournaments.forEach(tournament => {
    const game = tournament.game;
    if (!balanceCalculation[game]) {
      balanceCalculation[game] = {};
    }

    tournament.rounds.forEach(round => {
      round.hosts.forEach(hostObject => {
        const nickname = hostObject.host.nickname;
        if (hostObject.lostHosting) {
          if (!balanceCalculation.total[nickname]) {
            balanceCalculation.total[nickname] = {
              current: 0,
              lost: gameValues[game] * (round.bestOf + hostObject.timeBalance)
            };
          } else {
            balanceCalculation.total[nickname].lost += gameValues[game] * (round.bestOf + hostObject.timeBalance);
          }

          if (!balanceCalculation[game][nickname]) {
            balanceCalculation[game][nickname] = {
              current: 0,
              lost: gameValues[game] * (round.bestOf + hostObject.timeBalance)
            };
          } else {
            balanceCalculation[game][nickname].lost += gameValues[game] * (round.bestOf + hostObject.timeBalance);
          }
        } else {
          if (hostObject.timeBalance < 0) {
            if (!balanceCalculation.total[nickname]) {
              balanceCalculation.total[nickname] = {
                current: 0,
                lost: gameValues[game] * Math.abs(hostObject.timeBalance)
              };
            } else {
              balanceCalculation.total[nickname].lost += gameValues[game] * Math.abs(hostObject.timeBalance);
            }

            if (!balanceCalculation[game][nickname]) {
              balanceCalculation[game][nickname] = {
                current: 0,
                lost: gameValues[game] * Math.abs(hostObject.timeBalance)
              };
            } else {
              balanceCalculation[game][nickname].lost += gameValues[game] * Math.abs(hostObject.timeBalance);
            }
          }
        }
      })
    });
  });

  currentWeekTournaments.forEach(tournament => {
    const game = tournament.game;
    if (!balanceCalculation[game]) {
      balanceCalculation[game] = {};
    }

    tournament.rounds.forEach(round => {
      round.hosts.forEach(hostObject => {
        if (!hostObject.lostHosting) {
          const nickname = hostObject.host.nickname;
          if (!balanceCalculation.total[nickname]) {
            balanceCalculation.total[nickname] = {
              lost: 0,
              current: gameValues[game] * (round.bestOf + hostObject.timeBalance)
            };
          } else {
            balanceCalculation.total[nickname].current += gameValues[game] * (round.bestOf + hostObject.timeBalance);
          }

          if (!balanceCalculation[game][nickname]) {
            balanceCalculation[game][nickname] = {
              lost: 0,
              current: gameValues[game] * (round.bestOf + hostObject.timeBalance)
            };
          } else {
            balanceCalculation[game][nickname].current += gameValues[game] * (round.bestOf + hostObject.timeBalance);
          }
        }
      })
    });
  });

  const sortedCalculation = sortKeysRecursive(balanceCalculation, {
    compareFunction: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
  });

  return res.send(sortedCalculation);
});

router.get("/", auth, validateAccess("host"), async (req, res) => {
  const data = await Data.find({}).select("-calculation").sort("-date");
  res.send(data);
});

router.get("/gamevalues", auth, validateAccess("host"), async (req, res) => {
  const values = await getRecentGameValues();
  res.send(values);
});

router.post("/", auth, validateAccess("admin"), async (req, res) => {
  const monthData = new Data({
    date: req.body.date
  });
  await monthData.save();

  res.send(monthData);
});

router.get("/:date/my", auth, validateAccess("host"), async (req, res) => {
  const data = await Data.findOne({
    date: req.params.date
  });

  if (!data) return res.status(400).send("No such data period.");
  const hosts = data.calculation.hosts;
  const myCalculation = {
    hosts: {}
  };
  for (let [game, values] of Object.entries(hosts)) {
    if (hosts[game].total) {
      if (!hosts[game].total[req.user.nickname]) continue;
    }

    myCalculation.hosts[game] = {};
    if (values.total) {
      myCalculation.hosts[game].gameValue = values.gameValue;
      myCalculation.hosts[game].total = {};
      myCalculation.hosts[game].total[req.user.nickname] = values.total[req.user.nickname];
    } else {
      myCalculation.hosts[game][req.user.nickname] = values[req.user.nickname];
    }
  }

  data.calculation = myCalculation;
  res.send(data);
});

router.get("/:date", auth, validateAccess("admin"), async (req, res) => {
  const data = await Data.findOne({
    date: req.params.date
  });

  if (!data) return res.status(400).send("No such data period.");

  res.send({
    data,
    currentHash: data.generateCalcHash(data.calculation)
  });
});

router.get("/:date/log", auth, validateAccess("admin"), async (req, res) => {
  const fileName = `${req.params.date}-log.log`;
  gfs.exist({
    filename: fileName
  }, function(err, file) {
    if (err || !file) {
      res.send("File Not Found");
    } else {
      const readstream = gfs.createReadStream({
        filename: fileName
      });

      readstream.pipe(res);
    }
  });
});

router.post("/:date/calculate", auth, validateAccess("admin"), async (req, res) => {
  try {
    const data = await dataCalculation(req.params.date, req.body.gameValues, req.body.TLRatio);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;