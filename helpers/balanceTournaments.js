const {
  Tournament
} = require("../models/tournament");

module.exports = async function({
  previousWeekStart,
  previousWeekEnd,
  currentWeekStart,
  currentWeekEnd
}) {
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

  return {
    previousWeekTournaments,
    currentWeekTournaments
  };
}