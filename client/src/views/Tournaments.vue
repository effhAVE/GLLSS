<template>
  <v-card height="100%" color="transparent">
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
      @click:row="redirect"
    >
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
  data() {
    return {
      search: "",
      tournamentsList: [],
      headers: [
        {
          text: "Tournament name",
          align: "start",
          sortable: false,
          value: "name"
        },
        { text: "Game", value: "game" },
        { text: "Start date", value: "startDate" },
        { text: "End date", value: "endDate" }
      ]
    };
  },
  methods: {
    getTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.get(`${APIURL}/tournaments/`).then(response => {
        let tournaments = response.data;
        if (Array.isArray(tournaments)) {
          tournaments = tournaments.map(tournament => {
            if (tournament.series) {
              tournament.game = tournament.series.game;
            }

            return tournament;
          });
        }

        this.tournamentsList = tournaments;
      });
    },
    editItem(item) {},
    redirect(tournament) {
      return this.$router.push(`/tournaments/${tournament._id}`);
    }
  },
  mounted() {
    this.getTournaments();
  }
};
</script>

<style lang="scss">
tr {
  cursor: pointer;
}

.theme--dark.v-data-table.table-background {
  background: transparent;
}

.v-list-item.primary--text.v-list-item--active.v-list-item--link {
  color: var(--v-accent-base) !important;
}
</style>
