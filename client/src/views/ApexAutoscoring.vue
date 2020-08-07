<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Apex Autoscoring
    </v-card-title>
    <v-alert outlined type="warning" color="accent">
      Be sure to read the guide before performing any actions.
    </v-alert>
    <v-card-text>
      <v-text-field
        v-model.trim="id"
        color="accent"
        label="API ID"
        required
        @keydown.enter="getMatches"
        autocomplete="off"
        hint="https://apex.seatlon.eu/matches/API_ID"
      >
      </v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="accent" text @click="id = ''">
        Clear
      </v-btn>
      <v-btn color="accent" text @click="getMatches" :disabled="!id || recentlySent">
        Send
      </v-btn>
    </v-card-actions>
    <v-card-text>
      <p v-if="fetching">Fetching...</p>
      <div v-if="matches.length">
        <v-list color="transparent">
          <v-subheader>Matches</v-subheader>
          <v-list-item v-for="(match, i) in matches" :key="i" @click="selectMatch(i)" active-color="accent">
            <v-list-item-content>
              <v-list-item-title class="white--text">
                Start date: <span class="accent--text">{{ match.date | moment("MMMM DD HH:mm") }}</span>
                <v-list-item-icon v-if="selectedMatch === match">
                  <v-icon small color="accent">mdi-checkbox-blank-circle</v-icon>
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
                <v-text-field color="accent" class="mx-2" autocomplete="off" :placeholder="player.name" v-model="player.alternativeName" dense />
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
      id: "",
      fetching: false,
      requestSent: false,
      matches: [],
      selectedMatch: null,
      recentlySent: false
    };
  },
  methods: {
    getMatches() {
      this.fetching = true;
      this.recentlySent = true;
      this.selectedMatch = null;
      window.setTimeout(() => (this.recentlySent = false), 1000 * 5);
      this.$http
        .get(`${this.APIURL}/collections/apex?id=${this.id}`)
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.matches = response.data;
          this.fetching = false;
          this.requestSent = true;
        })
        .catch(error => {
          this.requestSent = false;
          this.matches = [];
          this.fetching = false;

          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error
          });
        });
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
    }
  }
};
</script>