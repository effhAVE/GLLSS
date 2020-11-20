<template>
  <v-card height="100%" color="transparent">
    <v-snackbar color="secondary border--accent" bottom right multi-line :timeout="0" :value="availableQueue.length">
      <p>You have {{ availableQueue.length }} availability change<span v-if="availableQueue.length !== 1">s</span>. Do you want to save them?</p>
      <v-btn text color="accent" @click="onAvailabilitySubmit"> Save </v-btn>
    </v-snackbar>
    <v-card-title> Tournaments </v-card-title>
    <v-card-text>
      <v-switch v-model="showPastTournaments" label="Show past tournaments" color="accent" dense></v-switch>
      <ActiveTournaments @availabilityChange="onAvailabilityChange" :gameFilters="gamesList" :regionFilters="regionsList" />
      <PastTournaments v-show="showPastTournaments" :gameFilters="gamesList" :regionFilters="regionsList" />
    </v-card-text>
  </v-card>
</template>

<script>
import ActiveTournaments from "../components/TournamentsList/Active";
import PastTournaments from "../components/TournamentsList/Past";

export default {
  components: {
    ActiveTournaments,
    PastTournaments
  },
  data() {
    return {
      availableQueue: [],
      showPastTournaments: this.$store.state.preferences.displayPastTournaments || false,
      gamesList: [],
      regionsList: []
    };
  },
  mounted() {
    this.$http.get(`${this.APIURL}/collections/games`).then(response => {
      this.gamesList = response.data;
    });

    this.$http.get(`${this.APIURL}/collections/regions`).then(response => {
      this.regionsList = response.data;
    });
  },
  methods: {
    onAvailabilityChange({ value, tournament, round }) {
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
      const promises = [];
      this.availableQueue.forEach(el => {
        promises.push(this.$http.put(`${this.APIURL}/tournaments/${el.tournamentID}/rounds/${el.roundID}/availability`, { value: el.value }));
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
    }
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

.theme--dark.v-data-table tbody .v-data-table__expanded__row:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background-color: var(--v-secondary-lighten1);
}

.not-editable {
  td {
    cursor: default;
  }
}
</style>
