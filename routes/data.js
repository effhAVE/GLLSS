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

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

async function getRecentGameValues() {
  const data = await Data.findOne().sort("-updatedAt").select("calculation.gameValues");
  return data.calculation;
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
  /* const previousWeekStart = moment().startOf("isoWeek").isoWeek(forWeek - 1).format();
  const previousWeekEnd = moment().endOf("isoWeek").isoWeek(forWeek - 1).format();
  const currentWeekStart = moment().startOf("isoWeek").isoWeek(forWeek).format();
  const currentWeekEnd = moment().endOf("isoWeek").isoWeek(forWeek).format(); */

  const previousWeekStart = moment().add(weekNumber - 1, "weeks").startOf("isoWeek").toDate();
  const previousWeekEnd = moment().add(weekNumber - 1, "weeks").endOf("isoWeek").toDate();
  const currentWeekStart = moment().add(weekNumber, "weeks").startOf("isoWeek").toDate();
  const currentWeekEnd = moment().add(weekNumber, "weeks").endOf("isoWeek").toDate();

  const balanceCalculation = {};
  const {
    gameValues
  } = await getRecentGameValues();

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

router.get("/:date", auth, validateAccess("admin"), async (req, res) => {
  const data = await Data.findOne({
    date: req.params.date
  });

  res.send(data);
});

router.get("/:date/log", auth, validateAccess("admin"), async (req, res) => {
  const fileName = path.join(logDir, `${req.params.date}-log.log`);
  const file = path.resolve(fileName);
  if (fs.existsSync(file)) {
    return res.download(file);
  }

  return res.status(404).send("No log file for date provided");
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
  const gameValues = req.body;
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
        totalValue: 0
      }
    }

    const calcGame = calculation.hosts[game];
    if (!calcGame.gameValue) {
      logger.error(`ERROR: No game value provided for ${game}!`);
      return res.status(400).send(`No game value provided for ${game}`);
    }
    if (!calcGame[region]) {
      calcGame[region] = {};
    }

    const calcRegion = calcGame[region];
    for (const round of tournament.rounds) {

      round.hosts.forEach(hostObject => {
        if (!hostObject.host) return;
        const hostID = hostObject.host.nickname;
        if (!calcRegion[hostID]) {
          calcRegion[hostID] = 0;
        }
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

          calculation.hosts.summary[hostID].hostValue += calcGame.total[hostID].hostValue += value;
          calculation.regions[region].totalValue += value;
          calculation.games[game].totalValue += value;

          calculation.hosts.summary[hostID].games += calcGame.total[hostID].games += round.bestOf;
          calculation.regions[region].gamesHosted += round.bestOf;
          calculation.games[game].gamesHosted += round.bestOf;
          calculation.total.gamesHosted += round.bestOf;

          calculation.total.hostingValue += value;
          calculation.total.totalValue += value;
          calculation.hosts.summary[hostID].totalValue += calcGame.total[hostID].totalValue = calcGame.total[hostID].hostValue + calcGame.total[hostID].TLValue;
          calcRegion[hostID] += round.bestOf;
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
          logger.info(`TL: ${TLObject.host.nickname}, Round ${round.name} inside ${tournament.name} \n had following values: prepTime - ${round.prepTime}, timeBalance - ${TLObject.timeBalance}`);
          TLTimeSlots[TLObject.host.nickname][tournament.game].push({
            id: round._id,
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
      for (let i = 0; i < timeSlot.length - 1; i++) {
        if (timeSlot[i].skipped) {
          timeSlot[i] = timeSlot[i - 1];
        }

        if (moment(timeSlot[i + 1].startDate).isSameOrAfter(timeSlot[i].startDate) && moment(timeSlot[i + 1].endDate).isSameOrBefore(timeSlot[i].endDate)) {
          timeSlot[i + 1].skipped = true;
          logger.info(` Skipped ${timeSlot[i + 1].id} (part of ${timeSlot[i].id})`);
        } else if (moment(timeSlot[i].endDate).isSameOrAfter(timeSlot[i + 1].startDate)) {
          logger.info(` Merged ${timeSlot[i].id} into ${timeSlot[i + 1].id}`);
          timeSlot[i + 1].startDate = moment.min(moment(timeSlot[i + 1].startDate), moment(timeSlot[i].startDate));
          timeSlot[i + 1].endDate = moment.max(moment(timeSlot[i + 1].endDate), moment(timeSlot[i].endDate));
        } else {
          mergedTimeSlots.push(moment(timeSlot[i].endDate).diff(timeSlot[i].startDate, "minutes"));
        }
      }

      const lastSlot = timeSlot[timeSlotsLength - 1];
      mergedTimeSlots.push(moment(lastSlot.endDate).diff(lastSlot.startDate, "minutes"));
      timeSlot.splice(0, timeSlot.length, ...mergedTimeSlots);
      const TLTime = TLTimeSlots[id][game].reduce((value, current) => value + current);
      const value = Math.ceil((TLTime / 60) * 100);

      calculation.hosts.summary[id].TLTime += calculation.hosts[game].total[id].TLTime = TLTime;
      calculation.hosts.summary[id].TLValue += calculation.hosts[game].total[id].TLValue = value;
      calculation.hosts.summary[id].totalValue += calculation.hosts[game].total[id].TLValue;
      calculation.hosts[game].total[id].totalValue = calculation.hosts[game].total[id].hostValue + calculation.hosts[game].total[id].TLValue;
      calculation.total.leadingValue += value;
      calculation.total.totalValue += value;
    }
  }


  data.calculation = calculation;
  await data.save();
  const routeEndTime = new Date().getTime();
  logger.info(`Calculation time: ${routeEndTime - routeStartTime}ms \n\n`);
  res.send(data);
});

module.exports = router;