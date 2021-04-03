import moment from "moment"

export default function(array) {
  let result = {};

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