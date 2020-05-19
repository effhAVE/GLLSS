import moment from "moment"

export default function(array, week) {
  let result = {};
  week = moment().add(week, "weeks").startOf("isoWeek").isoWeek();
  for (let i = 0; i < 7; i++) {
    result[moment().day("Monday").week(week).add(i, "days").format("DD-MMMM-YYYY")] = {};
  }

  return array.reduce((result, {
    roundStartDate,
    roundLocalStartDate,
    game,
    bestOf,
    names,
    hosts,
    teamLeads
  }) => {
    const roundDay = moment.utc(roundLocalStartDate).format("DD-MMMM-YYYY");
    if (!result[roundDay]) result[roundDay] = {};
    if (!result[roundDay][game]) result[roundDay][game] = [];
    result[roundDay][game].push({
      start: moment(roundStartDate).format("HH mm"),
      bestOf,
      available: names,
      hosts,
      teamLeads
    });

    return result;
  }, result);

}