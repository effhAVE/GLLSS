<template>
  <div>
    <v-row class="mt-4">
      <v-card-subtitle>Past tournaments</v-card-subtitle>
    </v-row>
    <v-data-table
      class="table-background"
      :items="tournamentsList"
      :headers="headers"
      :expanded.sync="expanded"
      @click:row="expand"
      no-data-text="No tournaments"
      show-expand
      hide-default-footer
      disable-pagination
      item-key="_id"
    >
      <template v-slot:item.rounds="{ item }">
        <div class="d-flex justify-space-between">
          <v-simple-checkbox :color="tournamentColor(item.rounds)" :value="isHostingTournament(item.rounds)" :ripple="false"></v-simple-checkbox>
        </div>
      </template>
      <template v-slot:expanded-item="{ headers, item }" tag="div">
        <td :colspan="headers.length">
          <v-simple-table class="table-background-inner">
            <template v-slot:default>
              <thead>
                <tr>
                  <th>Hosted</th>
                  <th>Round name</th>
                  <th>Best of</th>
                  <th>Start date</th>
                  <th>End date</th>
                </tr>
              </thead>
              <tbody>
                <tr :key="round._id" v-for="round in item.rounds">
                  <td width="50">
                    <v-simple-checkbox :color="roundColor(round)" :ripple="false" :value="round.isHosting || round.isLeading"></v-simple-checkbox>
                  </td>
                  <td>{{ round.name }}</td>
                  <td>{{ round.bestOf }}</td>
                  <td>{{ round.startDate | moment("MMMM DD, YYYY HH:mm") }}</td>
                  <td>{{ round.endDate | moment("MMMM DD, YYYY HH:mm") }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </td>
      </template>
      <template v-slot:item.name="{ item }">
        <router-link :to="`tournaments/${item._id}`" class="white--text">{{ item.name }}</router-link>
      </template>
      <template v-slot:item.startDate="{ item }">
        <span>{{ item.startDate | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
      <template v-slot:item.endDate="{ item }">
        <span>{{ item.endDate | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
      <template v-slot:footer>
        <div class="v-data-footer">
          <v-spacer></v-spacer>
          <v-btn class="accent--text" text tile @click="getNextTournamentPage" :disabled="allLoaded">
            Load more
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
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
      page: 0,
      limit: 10,
      expanded: [],
      allLoaded: false,
      headers: [
        {
          text: "Hosting",
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
        { text: "", value: "data-table-expand", width: 100 }
      ]
    };
  },
  methods: {
    getTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.get(`${APIURL}/tournaments/past?limit=${this.limit}&page=${this.page}`).then(response => {
        let tournaments = response.data;
        if (tournaments.length < this.limit) this.allLoaded = true;
        tournaments.forEach(tournament => {
          tournament.rounds.forEach(round => {
            round.isHosting = this.isHosting(round);
            round.isLeading = this.isLeading(round);
          });
        });

        this.tournamentsList.push(...tournaments);
      });
    },
    getNextTournamentPage() {
      this.page++;
      this.getTournaments();
    },
    roundColor(round) {
      return round.isLeading ? "blue" : "accent";
    },
    tournamentColor(rounds) {
      return rounds.some(round => round.isLeading) ? "blue" : "accent";
    },
    checkAvailability(round) {
      return round.available.includes(this.user._id);
    },
    isHosting(round) {
      return round.hosts.some(hostObj => hostObj.host === this.user._id);
    },
    isLeading(round) {
      return round.teamLeads.some(TLObj => TLObj.host === this.user._id);
    },
    isHostingTournament(rounds) {
      return rounds.some(round => round.isHosting);
    },
    onAvailabilityChange(value, tournament, round) {
      this.$emit("availabilityChange", { value, tournament, round });
    },
    setIcon(tournament) {
      if (tournament.rounds.every(round => round.myAvailability === false)) return "";
      else if (tournament.rounds.every(round => round.myAvailability === true)) return "mdi-checkbox-marked";
      else return "mdi-minus-box";
    },
    checkTournamentAvailability(tournament) {
      return !!this.setIcon(tournament);
    },
    expand(row) {
      this.expanded.includes(row) ? (this.expanded = this.expanded.filter(expanded => expanded !== row)) : this.expanded.push(row);
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