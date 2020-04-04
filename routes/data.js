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
        filename: path.join(logDir, `/${filenameError}.log`),
        level: "error"
      }),
      new winston.transports.File({
        filename: path.join(logDir, `/${filenameInfo}.log`),
        level: "info"
      })
    ]
  });
}


router.post("/", auth, validateAccess("admin"), async (req, res) => {
  const monthData = new Data(_.pick(req.body, ["date"]));
  await monthData.save();

  res.send(monthData);
});

router.get("/:date", auth, validateAccess("admin"), async (req, res) => {
  const date = await Data.findOne({
    date: req.params.date
  });

  res.send(date);
});

router.post("/:date/calculate", auth, validateAccess("admin"), async (req, res) => {
  const routeStartTime = new Date().getTime();
  const data = await Data.findOne({
    date: req.params.date
  });

  const logger = createLogger(`${data.date}-error`, `${data.date}-log`);
  logger.info("New calculation:");
  const gameValues = req.body;
  logger.notice(`Game values provided:`);
  for (let [name, value] of Object.entries(gameValues)) {
    logger.info(`${name}: ${value}`);
  }

  const tournaments = await Tournament.find({
    "endDate": {
      $gte: moment(req.params.date).startOf("month").format("YYYY-MM-DD hh:mm")
    },
    "startDate": {
      $lte: moment(req.params.date).endOf("month").format("YYYY-MM-DD hh:mm")
    }
  }).select("rounds region game").sort("startDate").populate("rounds.hosts.host rounds.teamLeads.host", "nickname");
  logger.info(`Tournaments found: ${tournaments.length}`);
  const calculation = {};


  for (const tournament of tournaments) {
    const {
      game,
      region
    } = tournament;

    if (!calculation[game]) {
      calculation[game] = {
        total: {},
        gameValue: gameValues[game]
      };
    }

    const calcGame = calculation[game];
    if (!calcGame.gameValue) {
      return res.status(400).send(`No game value provided for ${game}`);
    }
    if (!calcGame[region]) {
      calcGame[region] = {};
    }

    const calcRegion = calcGame[region];
    for (const round of tournament.rounds) {

      round.hosts.forEach(hostObject => {
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

        if (!hostObject.lostHosting) {
          calcGame.total[hostID].hostValue += (round.bestOf + hostObject.timeBalance) * calcGame.gameValue;
          calcGame.total[hostID].games += round.bestOf;
          calcGame.total[hostID].totalValue = calcGame.total[hostID].hostValue + calcGame.total[hostID].TLValue;
          calcRegion[hostID] += round.bestOf;
        }
      });

      round.teamLeads.forEach(TLObject => {
        const TLID = TLObject.host.nickname;
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
        if (!TLTimeSlots[TLObject.host.nickname]) {
          TLTimeSlots[TLObject.host.nickname] = {};
        }

        if (!TLTimeSlots[TLObject.host.nickname][tournament.game]) {
          TLTimeSlots[TLObject.host.nickname][tournament.game] = [];
        }

        if (!TLObject.lostLeading) {

        }
        logger.info(`TL: ${TLObject.host.nickname}, Round: ${round._id} \n With following values: prepTime - ${round.prepTime}, timeBalance - ${TLObject.timeBalance}`);
        TLTimeSlots[TLObject.host.nickname][tournament.game].push({
          id: round._id,
          startDate: moment(round.startDate).subtract(round.prepTime, "minutes").format(),
          endDate: moment(round.endDate).add(TLObject.timeBalance, "minutes").format()
        })
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
      calculation[game].total[id].TLTime = TLTime;
      calculation[game].total[id].TLValue = Math.ceil((TLTime / 60) * 100);
      calculation[game].total[id].totalValue = calculation[game].total[id].hostValue + calculation[game].total[id].TLValue;
    }
  }


  data.calculation = calculation;
  await data.save();
  const routeEndTime = new Date().getTime();
  logger.info(`Calculation time: ${routeEndTime - routeStartTime}ms \n\n`);
  res.send(data);
});

module.exports = router;