<template>
  <v-card height="100%" color="transparent">
    <v-snackbar
      v-model="availableQueue.length"
      color="secondary border--accent"
      bottom
      absolute
      right
      multi-line
      :timeout="0"
    >
      You have {{ availableQueue.length }} availability change
      <span v-if="availableQueue.length !== 1"> s </span>. Do you want to save
      them?
      <v-btn text color="accent" @click="onAvailabilitySubmit">
        Save
      </v-btn>
    </v-snackbar>
    <v-card-title>
      Tournaments
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      class="table-background"
      :items="tournamentsList"
      :search="search"
      :headers="headers"
      :expanded.sync="expanded"
      @click:row="redirect"
      :loading="!tournamentsList.length"
      show-expand
      item-key="_id"
    >
      <template v-slot:item.rounds="{ item }">
        <div class="d-flex justify-space-between">
          <v-simple-checkbox
            color="accent"
            :on-icon="setIcon(item)"
            :value="checkTournamentAvailability(item)"
            :ripple="false"
          ></v-simple-checkbox>
          <v-simple-checkbox
            color="accent"
            :value="isHostingTournament(item.rounds)"
            :ripple="false"
          ></v-simple-checkbox>
        </div>
      </template>
      <template v-slot:expanded-item="{ headers, item }" tag="div">
        <td :colspan="headers.length">
          <v-simple-table class="table-background-inner">
            <template v-slot:default>
              <thead>
                <tr>
                  <th>Available</th>
                  <th>Round name</th>
                  <th>Start date</th>
                  <th>End date</th>
                </tr>
              </thead>
              <tbody>
                <tr :key="round._id" v-for="round in item.rounds">
                  <td>
                    <v-simple-checkbox
                      v-model="round.myAvailability"
                      :disabled="round.isHosting"
                      color="accent"
                      :ripple="false"
                      @input="onAvailabilityChange($event, item, round)"
                    ></v-simple-checkbox>
                  </td>
                  <td>{{ round.name }}</td>
                  <td>{{ new Date(round.startDate).toLocaleString() }}</td>
                  <td>{{ new Date(round.endDate).toLocaleString() }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </td>
      </template>
      <template v-slot:item.startDate="{ item }">
        <span>{{ new Date(item.startDate).toLocaleString() }}</span>
      </template>
      <template v-slot:item.endDate="{ item }">
        <span>{{ new Date(item.endDate).toLocaleString() }}</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  props: {
    user: Object
  },
  data() {
    return {
      search: "",
      tournamentsList: [],
      expanded: [],
      availableQueue: [],
      headers: [
        {
          text: "Available / Selected",
          value: "rounds",
          width: 150,
          sortable: false
        },
        {
          text: "Tournament name",
          align: "start",
          sortable: false,
          value: "name"
        },
        { text: "Game", value: "game", align: "center", width: 200 },
        {
          text: "Rounds",
          value: "rounds.length",
          align: "center",
          width: 100,
          sortable: false
        },
        { text: "Start date", value: "startDate" },
        { text: "End date", value: "endDate" },
        { text: "", value: "data-table-expand" }
      ]
    };
  },
  methods: {
    getTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.get(`${APIURL}/tournaments/`).then(response => {
        let tournaments = response.data;
        tournaments.forEach(tournament => {
          tournament.rounds.forEach(round => {
            round.isHosting = this.isHosting(round);
            round.myAvailability = this.checkAvailability(round);
          });
        });

        this.tournamentsList = tournaments;
      });
    },
    checkAvailability(round) {
      return round.available.includes(this.user._id);
    },
    isHosting(round) {
      return round.hosts.some(hostObj => hostObj.host === this.user._id);
    },
    isHostingTournament(rounds) {
      return rounds.some(round => round.isHosting);
    },
    onAvailabilityChange(value, tournament, round) {
      const isAdded = this.availableQueue.find(el => el.roundID === round._id);
      if (isAdded) {
        this.availableQueue = this.availableQueue.filter(el => el !== isAdded);
        return;
      }

      this.availableQueue.push({
        tournamentID: tournament._id,
        roundID: round._id,
        value: value
      });
    },
    onAvailabilitySubmit() {
      const APIURL = process.env.VUE_APP_APIURL;
      const promises = [];
      this.availableQueue.forEach(el => {
        promises.push(
          this.$http.put(
            `${APIURL}/tournaments/${el.tournamentID}/rounds/${el.roundID}/availability`,
            { value: el.value, id: this.user._id }
          )
        );
      });

      this.availableQueue.splice(0);
      Promise.all(promises)
        .then(() => {
          this.$store.commit("snackbarMessage", {
            message: "Availability saved!",
            type: "success"
          });
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: "Error while saving availability.",
            type: "error"
          })
        );
    },
    setIcon(tournament) {
      if (tournament.rounds.every(round => round.myAvailability === false))
        return "";
      else if (tournament.rounds.every(round => round.myAvailability === true))
        return "mdi-checkbox-marked";
      else return "mdi-minus-box";
    },
    checkTournamentAvailability(tournament) {
      return !!this.setIcon(tournament);
    },
    redirect(tournament) {
      return this.$router.push(`/tournaments/${tournament._id}`);
    }
  },
  mounted() {
    this.getTournaments();
  },
  watch: {
    $route: "getTournaments"
  }
};
</script>

<style lang="scss">
td {
  cursor: pointer;
}

.v-application .primary.border--accent {
  border: solid 1px var(--v-accent-base) !important;
}

.theme--dark.v-data-table.table-background {
  background: transparent;
  border: thin solid rgba(255, 255, 255, 0.12);
}

.theme--dark.v-data-table.table-background-inner {
  background: var(--v-primary-lighten1);
}

.v-list-item.primary--text.v-list-item--active.v-list-item--link {
  color: var(--v-accent-base) !important;
}

.v-data-table__expanded.v-data-table__expanded__row {
  background-color: var(--v-secondary-base);
}

.theme--dark.v-data-table
  tbody
  .v-data-table__expanded__row:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background-color: var(--v-secondary-lighten1);
}

.not-editable {
  td {
    cursor: default;
  }
}
</style>
