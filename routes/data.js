const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const moment = require("moment");
const {
  Round
} = require("../models/round");
const {
  Tournament
} = require("../models/tournament");
const {
  User
} = require("../models/user");
const {
  Data
} = require("../models/data");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const logDir = "dataLogs";
const sortKeysRecursive = require('sort-keys-recursive');
const gridfs = require('gridfs-stream');
gridfs.mongo = mongoose.mongo;
const connection = mongoose.connection;
let gfs;
connection.once('open', function() {
  gfs = gridfs(connection.db);
});

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

async function getRecentGameValues() {
  const data = await Data.findOne().sort("-updatedAt").select("calculation.gameValues");
  return data.calculation.gameValues;
}

function createLogger(filenameError, filenameInfo) {
  return winston.createLogger({
    levels: winston.config.syslog.levels,
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(info => `${info.timestamp}: ${info.message}`),
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(logDir, `/${filenameInfo}.log`),
        options: {
          flags: "w"
        },
        level: "info"
      })
    ]
  });
}

router.get("/schedule", auth, validateAccess("teamleader"), async (req, res) => {
  const weekNumber = req.query.week || 0;
  const previousWeekStart = moment().add(weekNumber - 1, "weeks").startOf("isoWeek").toDate();
  const previousWeekEnd = moment().add(weekNumber - 1, "weeks").endOf("isoWeek").toDate();
  const currentWeekStart = moment().add(weekNumber, "weeks").startOf("isoWeek").toDate();
  const currentWeekEnd = moment().add(weekNumber, "weeks").endOf("isoWeek").toDate();

  const balanceCalculation = {};
  const gameValues = await getRecentGameValues();

  const previousWeekTournaments = await Tournament.find({
    "endDate": {
      $gte: previousWeekStart
    },
    "localStartDate": {
      $lte: previousWeekEnd
    },
    "rounds.localStartDate": {
      $gte: previousWeekStart
    },
    countedByRounds: true
  }).select("-series").sort("localStartDate").populate("rounds.hosts.host rounds.teamLeads.host", "nickname");;

  const currentWeekTournaments = await Tournament.find({
    "endDate": {
      $gte: currentWeekStart
    },
    "localStartDate": {
      $lte: currentWeekEnd
    },
    "rounds.localStartDate": {
      $gte: currentWeekStart
    },
    countedByRounds: true
  }).select("-series").sort("localStartDate").populate("rounds.hosts.host rounds.teamLeads.host", "nickname");;

  previousWeekTournaments.forEach(tournament => {
    const game = tournament.game;
    if (!balanceCalculation[game]) {
      balanceCalculation[game] = {};
    }

    tournament.rounds.forEach(round => {
      round.hosts.forEach(hostObject => {
        if (hostObject.lostHosting) {
          const nickname = hostObject.host.nickname;
          if (!balanceCalculation[game][nickname]) {
            balanceCalculation[game][nickname] = {
              current: 0,
              lost: gameValues[game] * round.bestOf
            };
          } else {
            balanceCalculation[game][nickname].lost += gameValues[game] * round.bestOf;
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
          if (!balanceCalculation[game][nickname]) {
            balanceCalculation[game][nickname] = {
              lost: 0,
              current: gameValues[game] * round.bestOf
            };
          } else {
            balanceCalculation[game][nickname].current += gameValues[game] * round.bestOf;
          }
        }
      })
    });
  });

  return res.send(balanceCalculation);
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
  const routeStartTime = new Date().getTime();
  const data = await Data.findOne({
    date: req.params.date
  });

  const rangeStart = moment(req.params.date).startOf("month").format("YYYY-MM-DD HH:mm");
  const rangeEnd = moment(req.params.date).endOf("month").format("YYYY-MM-DD HH:mm");

  const logger = createLogger(`${data.date}-error`, `${data.date}-log`);
  logger.info("New calculation:");
  const gameValues = req.body.gameValues;
  const TLRatio = req.body.TLRatio;
  logger.notice(`TL Ratio provided: ${TLRatio}`);
  logger.notice(`Game values provided:`);
  for (let [name, value] of Object.entries(gameValues)) {
    logger.info(`${name}: ${value}`);
  }

  let tournaments = await Tournament.find({
    "endDate": {
      $gte: rangeStart
    },
    "localStartDate": {
      $lte: rangeEnd
    }
  }).select("-series").sort("startDate").populate("rounds.hosts.host rounds.teamLeads.host", "nickname");
  logger.info(`Tournaments found: ${tournaments.length}`);
  const calculation = {
    gameValues: gameValues,
    hosts: {
      summary: {}
    },
    regions: {},
    games: {},
    total: {
      gamesHosted: 0,
      hostingValue: 0,
      leadingValue: 0,
      totalValue: 0
    }
  };

  tournaments = tournaments.filter(tournament => {
    const notCalculated = (!tournament.countedByRounds && moment(tournament.endDate).isSameOrAfter(rangeEnd));
    if (notCalculated) {
      logger.notice(`Tournament skipped: ${tournament.name} (id: ${tournament._id}) because it's not counted by rounds and it's endDate is ${moment(tournament.endDate).format("YYYY-MM-DD HH:mm")}`);
    }

    return !notCalculated;
  });

  tournaments.forEach(tournament => {
    if (tournament.countedByRounds) {
      tournament.rounds = tournament.rounds.filter(round => {
        const notCalculated = !moment(round.localStartDate).isSameOrAfter(rangeStart);
        if (notCalculated) {
          logger.notice(`Tournament: ${tournament.name} (id: ${tournament._id}). Round skipped: ${round.name} because it's not in the current month`);
        }

        return !notCalculated
      });
    } else {
      logger.notice(`Tournament: ${tournament.name} (id: ${tournament._id}) counted all rounds as it's end date is in the current month and it is NOT counted by rounds`);
    }
  });

  for (const tournament of tournaments) {
    const {
      game,
      region
    } = tournament;

    if (!calculation.hosts[game]) {
      calculation.hosts[game] = {
        total: {},
        gameValue: gameValues[game]
      };
    }

    if (!calculation.regions[region]) {
      calculation.regions[region] = {
        gamesHosted: 0,
        totalValue: 0
      }
    }

    if (!calculation.games[game]) {
      calculation.games[game] = {
        gamesHosted: 0,
        TLTime: 0,
        totalLeading: 0,
        totalHosting: 0,
        totalValue: 0,
        regions: {}
      }
    }

    const calcGame = calculation.hosts[game];
    if (!calcGame.gameValue) {
      logger.error(`ERROR: No game value provided for ${game}!`);
      return res.status(400).send(`No game value provided for ${game}`);
    }
    if (!calculation.games[game].regions[region]) {
      calculation.games[game].regions[region] = 0;
    }

    for (const round of tournament.rounds) {

      round.hosts.forEach(hostObject => {
        if (!hostObject.host) return;
        const hostID = hostObject.host.nickname;
        if (!calcGame.total[hostID]) {
          calcGame.total[hostID] = {
            hostValue: 0,
            TLValue: 0,
            TLTime: 0,
            games: 0,
            totalValue: 0
          };
        }

        if (!calculation.hosts.summary[hostID]) {
          calculation.hosts.summary[hostID] = {
            hostValue: 0,
            TLValue: 0,
            TLTime: 0,
            games: 0,
            totalValue: 0
          };
        }

        if (!hostObject.lostHosting) {
          if (hostObject.timeBalance) {
            logger.info(`Host: ${hostObject.host.nickname}, Round ${round.name} inside ${tournament.name} \n had timeBalance value of ${hostObject.timeBalance}`);
          }

          const value = (round.bestOf + hostObject.timeBalance) * calcGame.gameValue;

          calculation.hosts.summary[hostID].hostValue += value;
          calcGame.total[hostID].hostValue += value;
          calculation.regions[region].totalValue += value;
          calculation.games[game].totalHosting += value;
          calculation.games[game].totalValue += value;

          calculation.hosts.summary[hostID].games += (round.bestOf + hostObject.timeBalance);
          calcGame.total[hostID].games += (round.bestOf + hostObject.timeBalance);
          calculation.regions[region].gamesHosted += (round.bestOf + hostObject.timeBalance);
          calculation.games[game].gamesHosted += (round.bestOf + hostObject.timeBalance);
          calculation.total.gamesHosted += (round.bestOf + hostObject.timeBalance);

          calculation.total.hostingValue += value;
          calculation.total.totalValue += value;
          calculation.hosts.summary[hostID].totalValue += value;
          calcGame.total[hostID].totalValue = calcGame.total[hostID].hostValue;
          calculation.games[game].regions[region] += (round.bestOf + hostObject.timeBalance);
        } else {
          logger.info(`Host: ${hostObject.host.nickname} lost hosting of the following round - ${round.name} inside ${tournament.name}`);
        }
      });

      round.teamLeads.forEach(TLObject => {
        if (!TLObject.host) return;
        const TLID = TLObject.host.nickname;
        if (!calculation.hosts.summary[TLID]) {
          calculation.hosts.summary[TLID] = {
            hostValue: 0,
            TLValue: 0,
            TLTime: 0,
            games: 0,
            totalValue: 0
          };
        }

        if (!calcGame.total[TLID]) {
          calcGame.total[TLID] = {
            hostValue: 0,
            TLValue: 0,
            TLTime: 0,
            games: 0,
            totalValue: 0
          };
        }
      });
    };
  };


  let TLTimeSlots = {};
  tournaments.forEach(tournament => {
    tournament.rounds.forEach(round => {
      round.teamLeads.forEach(TLObject => {
        if (!TLObject.host) return;
        if (!TLTimeSlots[TLObject.host.nickname]) {
          TLTimeSlots[TLObject.host.nickname] = {};
        }

        if (!TLTimeSlots[TLObject.host.nickname][tournament.game]) {
          TLTimeSlots[TLObject.host.nickname][tournament.game] = [];
        }

        if (!TLObject.lostLeading) {
          if (round.prepTime || TLObject.timeBalance) {
            logger.info(`TL: ${TLObject.host.nickname}, Round ${round.name} inside ${tournament.name} \n had following values: prepTime - ${round.prepTime}, timeBalance - ${TLObject.timeBalance}`);
          }

          TLTimeSlots[TLObject.host.nickname][tournament.game].push({
            name: round.name,
            tournament: tournament.name,
            startDate: moment(round.startDate).subtract(round.prepTime, "minutes").format(),
            endDate: moment(round.endDate).add(TLObject.timeBalance, "minutes").format()
          });
        } else {
          logger.info(`TL: ${TLObject.host.nickname} lost leading of the following round - ${round.name} inside ${tournament.name}`);
        }
      });
    });
  });

  for (let [id, games] of Object.entries(TLTimeSlots)) {
    logger.info(`Teamlead ${id}:`);
    for (let [game, timeSlot] of Object.entries(games)) {
      timeSlot.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      const timeSlotsLength = timeSlot.length;
      const mergedTimeSlots = [];
      logger.info(` Game: ${game}`);
      if (timeSlotsLength === 1) {
        mergedTimeSlots.push(moment(timeSlot[0].endDate).diff(timeSlot[0].startDate, "minutes"));
        logger.info(`   Added ${timeSlot[0].name} of ${timeSlot[0].tournament} to calculation`);
      } else {
        for (let i = 0; i < timeSlotsLength - 1; i++) {
          if (timeSlot[i].skipped) {
            timeSlot[i] = timeSlot[i - 1];
          }

          if (moment(timeSlot[i + 1].startDate).isSameOrAfter(timeSlot[i].startDate) && moment(timeSlot[i + 1].endDate).isSameOrBefore(timeSlot[i].endDate)) {
            timeSlot[i + 1].skipped = true;
            logger.info(`   Skipped ${timeSlot[i + 1].name}, ${timeSlot[i + 1].tournament} (part of ${timeSlot[i].name}, ${timeSlot[i].tournament})`);
          } else if (moment(timeSlot[i].endDate).isSameOrAfter(timeSlot[i + 1].startDate)) {
            logger.info(`   Merged ${timeSlot[i].name}, ${timeSlot[i].tournament} into ${timeSlot[i + 1].name}, ${timeSlot[i + 1].tournament}`);
            timeSlot[i + 1].startDate = moment.min(moment(timeSlot[i + 1].startDate), moment(timeSlot[i].startDate));
            timeSlot[i + 1].endDate = moment.max(moment(timeSlot[i + 1].endDate), moment(timeSlot[i].endDate));
          } else {
            mergedTimeSlots.push(moment(timeSlot[i].endDate).diff(timeSlot[i].startDate, "minutes"));
            logger.info(`   Added ${timeSlot[0].name} of ${timeSlot[0].tournament} to calculation`);
          }

          if (i + 1 === timeSlotsLength - 1) {
            if (timeSlot[i + 1].skipped === true) {
              mergedTimeSlots.push(moment(timeSlot[i].endDate).diff(timeSlot[i].startDate, "minutes"));
              logger.info(`   Added ${timeSlot[0].name} of ${timeSlot[0].tournament} to calculation`);
            } else {
              mergedTimeSlots.push(moment(timeSlot[i + 1].endDate).diff(timeSlot[i + 1].startDate, "minutes"));
              logger.info(`   Added ${timeSlot[0].name} of ${timeSlot[0].tournament} to calculation`);
            }
          }
        }
      }

      timeSlot.splice(0, timeSlot.length, ...mergedTimeSlots);
      const TLTime = TLTimeSlots[id][game].reduce((value, current) => value + current, 0);
      const value = Math.ceil((TLTime / 60) * TLRatio);

      calculation.hosts.summary[id].TLTime += TLTime
      calculation.hosts[game].total[id].TLTime += TLTime;
      calculation.hosts.summary[id].TLValue += value;
      calculation.hosts[game].total[id].TLValue += value;
      calculation.hosts.summary[id].totalValue += value;
      calculation.hosts[game].total[id].totalValue = calculation.hosts[game].total[id].hostValue + calculation.hosts[game].total[id].TLValue;
      calculation.games[game].TLTime += TLTime;
      calculation.games[game].totalLeading += value;
      calculation.games[game].totalValue += value;
      calculation.total.leadingValue += value;
      calculation.total.totalValue += value;
    }
  }

  const sortedCalculation = sortKeysRecursive(calculation, {
    compareFunction: (a, b) => a.toLowerCase() > b.toLowerCase()
  });

  data.calculation = sortedCalculation;
  data.calcHash = data.generateCalcHash(calculation);
  await data.save();
  const routeEndTime = new Date().getTime();
  logger.info(`Calculation hash: ${data.calcHash}`);
  logger.info(`Use GET /api/data/${data.date} to fetch the results.`);
  logger.info(`Calculation time: ${routeEndTime - routeStartTime}ms \n\n`);
  const writestream = gfs.createWriteStream({
    filename: `${data.date}-log.log`,
    content_type: "text/plain",
    mode: "w"
  });

  gfs.exist({
    filename: `${data.date}-log.log`
  }, function(err, file) {
    if (file) {
      gfs.remove({
        filename: `${data.date}-log.log`
      });
    }

    fs.createReadStream(`${logDir}/${data.date}-log.log`).pipe(writestream);
  });

  res.send(data);
});

module.exports = router;