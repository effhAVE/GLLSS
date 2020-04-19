export default function(array) {
  return Object.values(array.reduce((result, {
    round,
    tournament,
    names
  }) => {
    if (!result[tournament]) result[tournament] = {
      tournament,
      rounds: []
    };

    result[tournament].rounds.push({
      roundName: round,
      available: names
    });

    return result;
  }, {}));

}