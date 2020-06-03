<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Teamkills script
    </v-card-title>
    <v-card-text>
      <v-text-field v-model.trim="matchID" color="accent" label="Match ID" required @keydown.enter="getTeamkills"> </v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="accent" text @click="matchID = ''">
        Clear
      </v-btn>
      <v-btn color="accent" text @click="getTeamkills" :disabled="!matchID || recentlySent">
        Send
      </v-btn>
    </v-card-actions>
    <v-card-text>
      <p v-if="fetching">Fetching...</p>
      <p v-if="teamkills.length" class="warning--text">
        Check the following player(s) with GLL page:
      </p>
      <p v-else-if="!teamkills.length && requestSent" class="success--text">
        No players with teamkills.
      </p>
      <div v-for="(teamkill, index) in teamkills" :key="index">
        <span class="font-weight-bold accent--text">{{ teamkill.name }}</span>
        should have {{ teamkill.kills }} kill(s)
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      matchID: "",
      fetching: false,
      requestSent: false,
      teamkills: [],
      recentlySent: false
    };
  },
  methods: {
    getTeamkills() {
      this.fetching = true;

      this.recentlySent = true;
      window.setTimeout(() => (this.recentlySent = false), 1000 * 5);
      this.$http
        .get(`${this.APIURL}/collections/teamkills?match=${this.matchID}`)
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.teamkills = this.checkTeamkills(response.data);
          this.fetching = false;
          this.requestSent = true;
        })
        .catch(error => {
          this.requestSent = false;
          this.teamkills = [];
          this.fetching = false;

          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error
          });
        });
    },
    checkTeamkills(matchData) {
      const players = matchData.included.filter(el => el.type === "participant");
      const playersWithTeamkills = players.filter(player => {
        const { teamKills, deathType } = player.attributes.stats;
        const suicideTK = deathType === "suicide" && teamKills > 1;
        const otherTK = deathType !== "suicide" && teamKills !== 0;
        return suicideTK || otherTK;
      });

      const playersStats = playersWithTeamkills.map(player => player.attributes.stats);
      return playersStats;
    }
  }
};
</script>