<template>
  <v-card height="100%" color="transparent">
    <v-card-title> Apex Autoscoring </v-card-title>
    <v-alert outlined type="warning" color="accent"> Be sure to read the guide before performing any actions. </v-alert>
    <v-card-text class="d-flex align-center">
      <v-text-field
        v-model.trim="ids"
        color="accent"
        label="Stats tokens"
        required
        @keydown.enter="getMatches"
        autocomplete="off"
        hint="Separate tokens with minus ( - ) sign"
      >
      </v-text-field>
      <v-btn v-show="this.matches.length" :disabled="!ids || recentlySent" @click="getMatches" text color="accent">Refresh</v-btn>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="accent" text @click="ids = ''"> Clear </v-btn>
      <v-btn color="accent" text @click="getMatches" :disabled="!ids || recentlySent"> Send </v-btn>
    </v-card-actions>
    <v-card-text>
      <p v-show="fetching">Fetching...</p>
      <div v-if="matches.length">
        <v-list color="transparent" dense>
          <v-list-item v-for="(match, i) in matches" :key="i" @click="selectMatch(i)" active-color="accent">
            <v-list-item-content>
              <v-list-item-title class="white--text">
                Start date: <span class="accent--text">{{ match.date | moment("MMMM DD HH:mm") }}</span>
                <span class="overline ml-4">Token ID: {{ match.id }}</span>
                <v-list-item-icon v-if="selectedMatch === match">
                  <v-icon x-small color="accent">mdi-checkbox-blank-circle</v-icon>
                </v-list-item-icon>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-btn v-if="selectedMatch" color="accent" text @click="getPlayers">Get mask</v-btn>
        <v-list v-if="selectedMatch" color="transparent" dense>
          <v-list-item v-for="(team, i) in selectedMatch.teams" :key="i">
            <v-list-item-content v-for="(player, i) in team" :key="i" class="pa-0">
              <v-list-item-title>
                <v-text-field
                  color="accent"
                  class="mx-2"
                  autocomplete="off"
                  :placeholder="player.name"
                  v-model="player.alternativeName"
                  @input="changePlayerName(player.name, $event)"
                  dense
                />
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      ids: "",
      fetching: false,
      matches: [],
      selectedMatch: null,
      recentlySent: false,
      changedPlayers: []
    };
  },
  mounted() {
    this.$http
      .get(`${this.APIURL}/codes/my`)
      .then(response => {
        if (response.status >= 400) throw new Error(response.data);
        this.ids = response.data.map(token => token.statsToken).join("-");
      })
      .catch(error => {
        this.matches = [];
        this.$store.commit("snackbarMessage", {
          type: "error",
          message: error
        });
      });
  },
  methods: {
    async getMatches() {
      this.fetching = true;
      this.recentlySent = true;
      this.selectedMatch = null;
      window.setTimeout(() => (this.recentlySent = false), 1000 * 60);
      const ids = this.ids.split("-");
      const promises = [];
      const responseMatches = [];
      for (const id of ids) {
        if (!id.length) continue;
        promises.push(
          this.$http
            .get(`${this.APIURL}/collections/apex?id=${id}`)
            .then(response => {
              if (response.status >= 400) throw new Error(response.data);
              const mappedMatches = response.data.map(el => ({ ...el, id: id }));
              responseMatches.push(...mappedMatches);
            })
            .catch(error => {
              this.matches = [];
              this.$store.commit("snackbarMessage", {
                type: "error",
                message: error
              });
            })
        );
      }

      await Promise.all(promises);
      if (!responseMatches.length) {
        this.$store.commit("snackbarMessage", {
          type: "warning",
          message: "No recent matches found."
        });
      }

      responseMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
      this.matches.push(...responseMatches.slice(this.matches.length));
      this.changedPlayers.forEach(player => {
        this.renamePlayersInMatches(this.matches, player.nickname, player.alternativeName);
      });

      this.fetching = false;
    },
    selectMatch(index) {
      this.selectedMatch = this.matches[index];
    },
    getPlayers() {
      const el = document.createElement("textarea");
      el.value = JSON.stringify(this.selectedMatch.teams);
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$store.commit("snackbarMessage", {
        type: "success",
        message: "Copied to clipboard!."
      });
    },
    renamePlayersInMatches(matches, nickname, value) {
      this.matches.forEach(match => {
        const players = match.teams.flat();
        const player = players.find(player => player.name === nickname);
        if (player) {
          player.alternativeName = value;
        }
      });
    },
    changePlayerName(nickname, value) {
      const matches = this.matches.filter(match => this.$moment().diff(this.$moment(match.date), "hours") < 24);
      this.changedPlayers = this.changedPlayers.filter(player => player.nickname !== nickname);
      if (value.length) {
        this.changedPlayers.push({ nickname, alternativeName: value });
      }

      this.renamePlayersInMatches(matches, nickname, value);
    }
  }
};
</script>