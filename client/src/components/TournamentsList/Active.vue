<template>
  <div>
    <v-row class="mb-4">
      <v-card-subtitle>Active tournaments</v-card-subtitle>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        color="accent"
        class="m0 pa-0"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-row>
    <v-data-table
      class="table-background"
      :items="tournamentsList"
      :search="search"
      :headers="headers"
      :expanded.sync="expanded"
      @click:row="redirect"
      no-data-text="No tournaments"
      show-expand
      item-key="_id"
      hide-default-footer
      disable-pagination
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
                  <td>{{ round.startDate | moment("lll") }}</td>
                  <td>{{ round.endDate | moment("lll") }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </td>
      </template>
      <template v-slot:item.startDate="{ item }">
        <span>{{ item.startDate | moment("lll") }}</span>
      </template>
      <template v-slot:item.endDate="{ item }">
        <span>{{ item.endDate | moment("lll") }}</span>
      </template>
      <template v-slot:footer>
        <div class="v-data-footer">
          <v-spacer></v-spacer>
          <v-btn
            class="accent--text"
            text
            tile
            @click="getNextTournamentPage"
            :disabled="allLoaded"
          >
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
      allLoaded: false,
      expanded: [],
      headers: [
        {
          text: "Available / Hosting",
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
      this.$http
        .get(`${APIURL}/tournaments/?limit=${this.limit}&page=${this.page}`)
        .then(response => {
          let tournaments = response.data;
          if (tournaments.length < this.limit) this.allLoaded = true;
          tournaments.forEach(tournament => {
            tournament.rounds.forEach(round => {
              round.isHosting = this.isHosting(round);
              round.myAvailability = this.checkAvailability(round);
            });
          });

          this.tournamentsList.push(...tournaments);
        });
    },
    getNextTournamentPage() {
      this.page++;
      this.getTournaments();
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
      this.$emit("availabilityChange", { value, tournament, round });
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