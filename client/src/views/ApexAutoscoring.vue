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
      <span class="warning--text caption" v-if="recentlySent"> You recently fetched matches. Please wait {{ cooldownCount }} seconds. </span>
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
      recentlySent: this.$moment().diff(this.$moment(this.$store.state.autoscoring.lastUpdate), "seconds") < 60,
      cooldownCount: 0,
      cooldownTimer: null
    };
  },
  computed: {
    changedPlayers() {
      return this.$store.state.autoscoring.changedPlayers;
    }
  },
  mounted() {
    const cooldown = this.$moment().diff(this.$moment(this.$store.state.autoscoring.lastUpdate), "seconds");
    if (this.recentlySent) this.handleCooldown(60 - cooldown);
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
    handleCooldown(cooldown) {
      this.cooldownCount = cooldown || 60;
      this.recentlySent = true;
      if (!cooldown) this.$store.commit("fetchedApexMatches");
      this.cooldownTimer = window.setInterval(() => {
        if (this.cooldownCount < 1) {
          this.recentlySent = false;
          this.cooldownCount = 0;
          window.clearInterval(this.cooldownTimer);
          this.cooldownTimer = null;
        } else this.cooldownCount--;
      }, 1000);
    },
    async getMatches() {
      this.fetching = true;
      this.selectedMatch = null;
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
      this.matches = responseMatches;
      this.changedPlayers.forEach(player => {
        this.renamePlayersInMatches(player.nickname, player.alternativeName);
      });

      this.fetching = false;
      this.handleCooldown();
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
    renamePlayersInMatches(nickname, value) {
      this.matches.forEach(match => {
        const players = match.teams.flat();
        const player = players.find(player => player.name === nickname);
        if (player) {
          player.alternativeName = value;
        }
      });
    },
    changePlayerName(nickname, value) {
      this.$store.commit("changePlayerName", { nickname, alternativeName: value });
      this.renamePlayersInMatches(nickname, value);
    }
  }
};
</script>