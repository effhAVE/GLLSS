const auth = require("../middleware/auth");
const validateAccess = require("../middleware/validateAccess");
const moment = require("moment");
const { Tournament } = require("../models/tournament");
const { Data } = require("../models/data");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const logDir = "dataLogs";
const sortKeysRecursive = require("sort-keys-recursive");
const balanceTournaments = require("../helpers/balanceTournaments");
const gridfs = require("gridfs-stream");
const schedule = require("node-schedule");
const dataCalculation = require("../helpers/dataCalculation");
const winston = require("winston");
gridfs.mongo = mongoose.mongo;
const connection = mongoose.connection;
let gfs;
connection.once("open", function () {
  gfs = gridfs(connection.db);
});

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

schedule.scheduleJob("0 * * * *", async () => {
  const values = await getRecentValues();
  const date = moment().format("YYYY-MM");

  try {
    winston.info(`Recalculated values for ${date} with following values: ${JSON.stringify(values)}`);
    await dataCalculation(date, values.gameValues, values.TLRatio);
  } catch (err) {
    winston.log({ level: "error", message: err });
  }
});

async function getRecentValues() {
  const data = await Data.findOne().sort("-updatedAt").select("calculation.gameValues TLRatio");
  if (!data.TLRatio) data.TLRatio = 100;
  return { gameValues: data.calculation.gameValues, TLRatio: data.TLRatio };
}

router.get("/schedule/teamleads", auth, validateAccess("schedule.TLBalance"), async (req, res) => {
  const weekNumber = req.query.week || 0;
  const previousWeekStart = moment()
    .add(weekNumber - 1, "weeks")
    .startOf("isoWeek")
    .toDate();
  const previousWeekEnd = moment()
    .add(weekNumber - 1, "weeks")
    .endOf("isoWeek")
    .toDate();
  const currentWeekStart = moment().add(weekNumber, "weeks").startOf("isoWeek").toDate();
  const currentWeekEnd = moment().add(weekNumber, "weeks").endOf("isoWeek").toDate();

  const TLRatio = (await getRecentValues()).TLRatio;

  const balanceCalculation = {
    total: {}
  };

  const { previousWeekTournaments, currentWeekTournaments } = await balanceTournaments({
    previousWeekStart,
    previousWeekEnd,
    currentWeekStart,
    currentWeekEnd
  });

  let timeSlotsLost = {};
  previousWeekTournaments.forEach(tournament => {
    tournament.rounds.forEach(round => {
      round.teamLeads.forEach(TLObject => {
        if (!TLObject.host) return;
        if (!timeSlotsLost[TLObject.host.nickname]) {
          timeSlotsLost[TLObject.host.nickname] = {};
        }

        if (!timeSlotsLost[TLObject.host.nickname][tournament.game]) {
          timeSlotsLost[TLObject.host.nickname][tournament.game] = [];
        }

        if (TLObject.lostLeading) {
          timeSlotsLost[TLObject.host.nickname][tournament.game].push({
            lostLeading: true,
            startDate: moment(round.startDate).subtract(round.prepTime, "minutes").format(),
            endDate: moment(round.endDate).add(TLObject.timeBalance, "minutes").format()
          });
        } else if (!TLObject.lostLeading && TLObject.timeBalance < 0) {
          timeSlotsLost[TLObject.host.nickname][tournament.game].push({
            lostLeading: true,
            startDate: moment(round.endDate).add(TLObject.timeBalance, "minutes").format(),
            endDate: moment(round.endDate).format()
          });
        }
      });
    });
  });

  const previousWeekCollisions = {};
  for (let [id, games] of Object.entries(timeSlotsLost)) {
    for (let [game, timeSlot] of Object.entries(games)) {
      timeSlot.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      const timeSlotsLength = timeSlot.length;
      const mergedTimeSlots = [];
      if (timeSlotsLength === 1) {
        mergedTimeSlots.push(timeSlot[0]);
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
          } else if (moment(timeSlot[i].endDate).isSameOrAfter(timeSlot[i + 1].startDate)) {
            timeSlot[i + 1].startDate = moment.min(moment(timeSlot[i + 1].startDate), moment(timeSlot[i].startDate));
            timeSlot[i + 1].endDate = moment.max(moment(timeSlot[i + 1].endDate), moment(timeSlot[i].endDate));
          } else {
            mergedTimeSlots.push(timeSlot[i]);
          }

          if (i + 1 === timeSlotsLength - 1) {
            if (timeSlot[i + 1].skipped === true) {
              mergedTimeSlots.push(timeSlot[i]);
            } else {
              mergedTimeSlots.push(timeSlot[i + 1]);
            }
          }
        }
      }

      timeSlot.splice(0, timeSlot.length, ...mergedTimeSlots);
      if (!previousWeekCollisions[id]) previousWeekCollisions[id] = {};
      previousWeekCollisions[id][game] = mergedTimeSlots;
    }
  }

  let previousWeekTLTimeSlots = {};
  previousWeekTournaments.forEach(tournament => {
    tournament.rounds.forEach(round => {
      round.teamLeads.forEach(TLObject => {
        if (!TLObject.host) return;
        if (!previousWeekTLTimeSlots[TLObject.host.nickname]) {
          previousWeekTLTimeSlots[TLObject.host.nickname] = {};
        }

        if (!previousWeekTLTimeSlots[TLObject.host.nickname][tournament.game]) {
          previousWeekTLTimeSlots[TLObject.host.nickname][tournament.game] = [];
        }

        if (!TLObject.lostLeading) {
          previousWeekTLTimeSlots[TLObject.host.nickname][tournament.game].push({
            lostLeading: false,
            startDate: moment(round.startDate).subtract(round.prepTime, "minutes").format(),
            endDate: moment(round.endDate).add(TLObject.timeBalance, "minutes").format()
          });
        }
      });
    });
  });

  for (let [id, games] of Object.entries(previousWeekTLTimeSlots)) {
    for (let [game, timeSlot] of Object.entries(games)) {
      timeSlot.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      const timeSlotsLength = timeSlot.length;
      const mergedTimeSlots = [];
      if (timeSlotsLength === 1) {
        mergedTimeSlots.push(timeSlot[0]);
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
          } else if (moment(timeSlot[i].endDate).isSameOrAfter(timeSlot[i + 1].startDate)) {
            timeSlot[i + 1].startDate = moment.min(moment(timeSlot[i + 1].startDate), moment(timeSlot[i].startDate));
            timeSlot[i + 1].endDate = moment.max(moment(timeSlot[i + 1].endDate), moment(timeSlot[i].endDate));
          } else {
            mergedTimeSlots.push(timeSlot[i]);
          }

          if (i + 1 === timeSlotsLength - 1) {
            if (timeSlot[i + 1].skipped === true) {
              mergedTimeSlots.push(timeSlot[i]);
            } else {
              mergedTimeSlots.push(timeSlot[i + 1]);
            }
          }
        }
      }

      timeSlot.splice(0, timeSlot.length, ...mergedTimeSlots);
      if (!previousWeekCollisions[id]) previousWeekCollisions[id] = {};
      previousWeekCollisions[id][game].push(...mergedTimeSlots);
    }
  }

  for (let [id, games] of Object.entries(previousWeekCollisions)) {
    if (!balanceCalculation.total[id]) {
      balanceCalculation.total[id] = {
        current: 0,
        lost: 0
      };
    }
    for (let [game, timeSlot] of Object.entries(games)) {
      if (!balanceCalculation[game]) {
        balanceCalculation[game] = {};
      }
      if (!balanceCalculation[game][id]) {
        balanceCalculation[game][id] = 0;
      }

      timeSlot.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      for (const slot of previousWeekCollisions[id][game].filter(collision => collision.lostLeading)) {
        for (const leading of previousWeekCollisions[id][game].filter(collision => !collision.lostLeading)) {
          if (moment(leading.startDate).isSameOrBefore(slot.startDate)) {
            if (!moment(leading.endDate).isSameOrBefore(slot.startDate)) {
              if (moment(leading.endDate).isBefore(slot.endDate)) {
                slot.startDate = leading.endDate;
              } else {
                previousWeekCollisions[id][game] = previousWeekCollisions[id][game].filter(el => el !== slot);
              }
            }
          } else {
            if (moment(leading.startDate).isBefore(slot.endDate)) {
              if (moment(leading.endDate).isBefore(slot.endDate)) {
                previousWeekCollisions[id][game].push({
                  lostLeading: true,
                  startDate: leading.endDate,
                  endDate: slot.endDate
                });
              }

              slot.endDate = leading.startDate;
            }
          }
        }
      }

      const TLTime = previousWeekCollisions[id][game].reduce((total, timeSlot) => {
        return timeSlot.lostLeading ? (total += moment(timeSlot.endDate).diff(timeSlot.startDate, "minutes")) : total;
      }, 0);

      const value = Math.ceil((TLTime / 60) * TLRatio);
      balanceCalculation.total[id].lost += value;
    }
  }

  let TLTimeSlots = {};
  currentWeekTournaments.forEach(tournament => {
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
          TLTimeSlots[TLObject.host.nickname][tournament.game].push({
            startDate: moment(round.startDate).subtract(round.prepTime, "minutes").format(),
            endDate: moment(round.endDate).add(TLObject.timeBalance, "minutes").format()
          });
        }
      });
    });
  });

  for (let [id, games] of Object.entries(TLTimeSlots)) {
    if (!balanceCalculation.total[id]) {
      balanceCalculation.total[id] = {
        current: 0,
        lost: 0
      };
    }
    for (let [game, timeSlot] of Object.entries(games)) {
      if (!balanceCalculation[game]) {
        balanceCalculation[game] = {};
      }
      if (!balanceCalculation[game][id]) {
        balanceCalculation[game][id] = 0;
      }

      timeSlot.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      const timeSlotsLength = timeSlot.length;
      const mergedTimeSlots = [];
      if (timeSlotsLength === 1) {
        mergedTimeSlots.push(moment(timeSlot[0].endDate).diff(timeSlot[0].startDate, "minutes"));
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
          } else if (moment(timeSlot[i].endDate).isSameOrAfter(timeSlot[i + 1].startDate)) {
            timeSlot[i + 1].startDate = moment.min(moment(timeSlot[i + 1].startDate), moment(timeSlot[i].startDate));
            timeSlot[i + 1].endDate = moment.max(moment(timeSlot[i + 1].endDate), moment(timeSlot[i].endDate));
          } else {
            mergedTimeSlots.push(moment(timeSlot[i].endDate).diff(timeSlot[i].startDate, "minutes"));
          }

          if (i + 1 === timeSlotsLength - 1) {
            if (timeSlot[i + 1].skipped === true) {
              mergedTimeSlots.push(moment(timeSlot[i].endDate).diff(timeSlot[i].startDate, "minutes"));
            } else {
              mergedTimeSlots.push(moment(timeSlot[i + 1].endDate).diff(timeSlot[i + 1].startDate, "minutes"));
            }
          }
        }
      }

      timeSlot.splice(0, timeSlot.length, ...mergedTimeSlots);
      const TLTime = TLTimeSlots[id][game].reduce((value, current) => value + current, 0);
      const value = Math.ceil((TLTime / 60) * TLRatio);
      balanceCalculation[game][id] += value;
      balanceCalculation.total[id].current += value;
    }
  }

  const sortedCalculation = sortKeysRecursive(balanceCalculation, {
    compareFunction: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
  });

  return res.send(sortedCalculation);
});

router.get("/schedule", auth, validateAccess("schedule.hostsBalance"), async (req, res) => {
  const weekNumber = req.query.week || 0;
  const previousWeekStart = moment()
    .add(weekNumber - 1, "weeks")
    .startOf("isoWeek")
    .toDate();
  const previousWeekEnd = moment()
    .add(weekNumber - 1, "weeks")
    .endOf("isoWeek")
    .toDate();
  const currentWeekStart = moment().add(weekNumber, "weeks").startOf("isoWeek").toDate();
  const currentWeekEnd = moment().add(weekNumber, "weeks").endOf("isoWeek").toDate();

  const balanceCalculation = {
    total: {}
  };
  const gameValues = (await getRecentValues()).gameValues;
  const { previousWeekTournaments, currentWeekTournaments } = await balanceTournaments({
    previousWeekStart,
    previousWeekEnd,
    currentWeekStart,
    currentWeekEnd
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
      });
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
      });
    });
  });

  const sortedCalculation = sortKeysRecursive(balanceCalculation, {
    compareFunction: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
  });

  return res.send(sortedCalculation);
});

router.get("/", auth, validateAccess("data.view"), async (req, res) => {
  const data = await Data.find({}).select("-calculation").sort("-date");
  return res.send(data);
});

router.get("/recentvalues", auth, validateAccess("data.view"), async (req, res) => {
  const values = await getRecentValues();
  return res.send(values);
});

router.post("/", auth, validateAccess("data.create"), async (req, res) => {
  const monthData = new Data({
    date: req.body.date
  });
  await monthData.save();

  return res.send(monthData);
});

router.get("/:date/my", auth, validateAccess("data.view"), async (req, res) => {
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
  return res.send(data);
});

router.get("/:date", auth, validateAccess("data.viewAll"), async (req, res) => {
  const data = await Data.findOne({
    date: req.params.date
  });

  if (!data) return res.status(400).send("No such data period.");

  return res.send({
    data,
    currentHash: data.generateCalcHash(data.calculation)
  });
});

router.get("/:date/log", auth, validateAccess("data.viewLogs"), async (req, res) => {
  const fileName = `${req.params.date}-log.log`;
  gfs.exist(
    {
      filename: fileName
    },
    function (err, file) {
      if (err || !file) {
        return res.send("File Not Found");
      } else {
        const readstream = gfs.createReadStream({
          filename: fileName
        });

        readstream.pipe(res);
      }
    }
  );
});

router.post("/:date/calculate", auth, validateAccess("data.update"), async (req, res) => {
  try {
    const data = await dataCalculation(req.params.date, req.body.gameValues, req.body.TLRatio);
    return res.send(data);
  } catch (err) {
    winston.crit(err);
    return res.status(400).send(err);
  }
});

module.exports = router;
