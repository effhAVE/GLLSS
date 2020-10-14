export default {
  state: () => ({
    changedPlayers: [],
    lastUpdate: null
  }),
  mutations: {
    changePlayerName(state, changedPlayer) {
      const addedPlayer = state.changedPlayers.find(player => player.nickname === changedPlayer.nickname);

      if (addedPlayer) {
        if (changedPlayer.alternativeName.length) addedPlayer.alternativeName = changedPlayer.alternativeName;
        else {
          const index = state.changedPlayers.indexOf(addedPlayer);
          state.changedPlayers.splice(index, 1);
        }
      } else if (changedPlayer.alternativeName.length) {
        state.changedPlayers.push(changedPlayer);
      }
    },
    fetchedApexMatches(state) {
      state.lastUpdate = new Date();
    }
  }
};
