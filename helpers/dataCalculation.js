const { Tournament } = require("../models/tournament");
const { Data } = require("../models/data");
const path = require("path");
const mongoose = require("mongoose");
const winston = require("winston");
const moment = require("moment");
const logDir = "dataLogs";
const fs = require("fs");
const sortKeysRecursive = require("sort-keys-recursive");
const gridfs = require("gridfs-stream");
gridfs.mongo = mongoose.mongo;
const connection = mongoose.connection;
let gfs;
connection.once("open", function () {
  gfs = gridfs(connection.db);
});

function createLogger(filenameError, filenameInfo) {
  return winston.createLogger({
    levels: winston.config.syslog.levels,
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      winston.format.printf(info => `${info.timestamp}: ${info.message}`)
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

module.exports = async function (date, gameValues, TLRatio) {
  let data = await Data.findOne({
    date: date
  });

  if (!data) {
    winston.info(`No data month for ${date}. Creating...`);
    data = new Data({
      date: date
    });

    await data.save();
  }

  const routeStartTime = new Date().getTime();
  const rangeStart = moment(date).startOf("month").format("YYYY-MM-DD HH:mm");
  const rangeEnd = moment(date).endOf("month").format("YYYY-MM-DD HH:mm");

  const logger = createLogger(`${data.date}-error`, `${data.date}-log`);
  logger.info("New calculation:");
  logger.notice(`TL Ratio provided: ${TLRatio}`);
  logger.notice(`Game values provided:`);
  for (let [name, value] of Object.entries(gameValues)) {
    logger.info(`${name}: ${value}`);
  }

  let tournaments = await Tournament.find({
    endDate: {
      $gte: rangeStart
    },
    localStartDate: {
      $lte: rangeEnd
    }
  })
    .select("-series")
    .sort("startDate")
    .populate("rounds.hosts.host rounds.teamLeads.host", "nickname");
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
    const notCalculated = !tournament.countedByRounds && moment(tournament.endDate).isSameOrAfter(rangeEnd);
    if (notCalculated) {
      logger.notice(
        `Tournament skipped: ${tournament.name} (id: ${tournament._id}) because it's not counted by rounds and it's endDate is ${moment(
          tournament.endDate
        ).format("YYYY-MM-DD HH:mm")}`
      );
    }

    return !notCalculated;
  });

  tournaments.forEach(tournament => {
    if (tournament.countedByRounds) {
      tournament.rounds = tournament.rounds.filter(round => {
        const notCalculated = !moment(round.localStartDate).isSameOrAfter(rangeStart) || !moment(round.localStartDate).isSameOrBefore(rangeEnd);
        if (notCalculated) {
          logger.notice(`Tournament: ${tournament.name} (id: ${tournament._id}). Round skipped: ${round.name} because it's not in the current month`);
        }

        return !notCalculated;
      });
    } else {
      logger.notice(
        `Tournament: ${tournament.name} (id: ${tournament._id}) counted all rounds as it's end date is in the current month and it is NOT counted by rounds`
      );
    }
  });

  for (const tournament of tournaments) {
    const { game, region } = tournament;

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
      };
    }

    if (!calculation.games[game]) {
      calculation.games[game] = {
        gamesHosted: 0,
        TLTime: 0,
        totalLeading: 0,
        totalHosting: 0,
        totalValue: 0,
        regions: {}
      };
    }

    const calcGame = calculation.hosts[game];
    if (!calcGame.gameValue) {
      logger.error(`ERROR: No game value provided for ${game}!`);
      throw new Error(`No game value provided for ${game}`);
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
            logger.info(
              `Host: ${hostObject.host.nickname}, Round ${round.name} inside ${tournament.name} \n had timeBalance value of ${hostObject.timeBalance}`
            );
          }

          const value = (round.bestOf + hostObject.timeBalance) * calcGame.gameValue;

          calculation.hosts.summary[hostID].hostValue += value;
          calcGame.total[hostID].hostValue += value;
          calculation.regions[region].totalValue += value;
          calculation.games[game].totalHosting += value;
          calculation.games[game].totalValue += value;

          calculation.hosts.summary[hostID].games += round.bestOf + hostObject.timeBalance;
          calcGame.total[hostID].games += round.bestOf + hostObject.timeBalance;
          calculation.regions[region].gamesHosted += round.bestOf + hostObject.timeBalance;
          calculation.games[game].gamesHosted += round.bestOf + hostObject.timeBalance;
          calculation.total.gamesHosted += round.bestOf + hostObject.timeBalance;

          calculation.total.hostingValue += value;
          calculation.total.totalValue += value;
          calculation.hosts.summary[hostID].totalValue += value;
          calcGame.total[hostID].totalValue = calcGame.total[hostID].hostValue;
          calculation.games[game].regions[region] += round.bestOf + hostObject.timeBalance;
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
    }
  }

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
            logger.info(
              `TL: ${TLObject.host.nickname}, Round ${round.name} inside ${tournament.name} \n had following values: prepTime - ${round.prepTime}, timeBalance - ${TLObject.timeBalance}`
            );
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

          if (
            moment(timeSlot[i + 1].startDate).isSameOrAfter(timeSlot[i].startDate) &&
            moment(timeSlot[i + 1].endDate).isSameOrBefore(timeSlot[i].endDate)
          ) {
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

      calculation.hosts.summary[id].TLTime += TLTime;
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
    compareFunction: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
  });

  data.calculation = sortedCalculation;
  data.calcHash = data.generateCalcHash(calculation);
  data.TLRatio = TLRatio;
  data.markModified("calculation");
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

  gfs.exist(
    {
      filename: `${data.date}-log.log`
    },
    function (err, file) {
      if (file) {
        gfs.remove({
          filename: `${data.date}-log.log`
        });
      }

      fs.createReadStream(`${logDir}/${data.date}-log.log`).pipe(writestream);
    }
  );

  return data;
};
