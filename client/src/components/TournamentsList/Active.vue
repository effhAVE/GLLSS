<template>
  <div>
    <v-row class="mb-4">
      <v-card-subtitle>Active tournaments</v-card-subtitle>
      <v-spacer></v-spacer>
    </v-row>
    <v-row class="flex-column flex-sm-row mb-4" no-gutters>
      <v-col col="3" class="pa-1">
        <v-select
          :items="gameFilters"
          @change="changeFilters"
          v-model="selectedGameFilters"
          label="Games"
          outlined
          multiple
          dense
          color="accent"
          item-color="accent"
          class="filter-input"
          clearable
          :menu-props="{ bottom: true, offsetY: true }"
        ></v-select>
      </v-col>
      <v-col col="3" class="pa-1">
        <v-select
          :items="regionFilters"
          @change="changeFilters"
          item-text="name"
          item-value="name"
          v-model="selectedRegionFilters"
          multiple
          label="Regions"
          class="filter-input"
          outlined
          dense
          color="accent"
          item-color="accent"
          clearable
          :menu-props="{ bottom: true, offsetY: true }"
        >
          <template v-slot:selection="{ item, index }">
            <span v-if="index < 2">{{ item.name }}, </span>
            <span v-if="index === 2" class="grey--text caption ml-1">(+{{ selectedRegionFilters.length - 2 }} others)</span>
          </template>
        </v-select>
      </v-col>
      <v-col col="3" class="pa-1">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          color="accent"
          class="pa-0 filter-input"
          label="Name"
          single-line
          hide-details
          outlined
          dense
          @keyup="searchTimeout"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table
      class="table-background"
      :items="tournamentsList"
      :headers="headers"
      :expanded.sync="expanded"
      @click:row="expand"
      show-expand
      no-data-text="No tournaments"
      item-key="_id"
      hide-default-footer
      disable-pagination
      mobile-breakpoint="740"
      ref="tournamentsTable"
    >
      <template v-slot:header.rounds>
        <div class="d-flex align-center justify-space-between">
          <v-simple-checkbox
            color="accent"
            :value="checkFilteredAvailability()"
            :ripple="false"
            @input="setFilteredAvailability($event)"
            :disabled="!$store.getters.hasPermission('hosting.fillAvailability')"
          ></v-simple-checkbox>
          <p class="ma-0">Available / Hosting</p>
        </div>
      </template>
      <template v-slot:header.data-table-expand>
        <v-btn color="accent" class="black--text hidden-sm-and-down" x-small @click.stop="expandAll"> Expand all </v-btn>
        <v-btn color="accent" class="hidden-md-and-up" icon x-small @click.stop="expandAll"><v-icon>mdi-arrow-down</v-icon></v-btn>
      </template>
      <template v-slot:item.rounds="{ item }">
        <div class="d-flex">
          <v-simple-checkbox
            color="accent"
            :on-icon="setIcon(item)"
            :value="checkTournamentAvailability(item)"
            @input="setTournamentAvailability($event, item)"
            :ripple="false"
            :disabled="!$store.getters.hasPermission('hosting.fillAvailability')"
          ></v-simple-checkbox>
          <v-simple-checkbox
            :color="tournamentColor(item.rounds)"
            :value="isHostingTournament(item.rounds)"
            :ripple="false"
            class="ml-sm-12 ml-2"
          ></v-simple-checkbox>
        </div>
      </template>
      <template v-slot:expanded-item="{ headers, item }" tag="div">
        <td :colspan="headers.length" class="pa-0 px-md-4">
          <v-simple-table class="table-background-inner">
            <template v-slot:default>
              <thead>
                <tr>
                  <th>
                    <span class="hidden-xs-only">Available</span>
                    <span class="hidden-sm-and-up">Av.</span>
                  </th>
                  <th>
                    <span class="hidden-xs-only">Hosting</span>
                    <span class="hidden-sm-and-up">H.</span>
                  </th>
                  <th class="hidden-xs-only">Round name</th>
                  <th>Best of</th>
                  <th>Start date</th>
                  <th class="hidden-xs-only">End date</th>
                </tr>
              </thead>
              <tbody>
                <tr :key="round._id" v-for="round in item.rounds">
                  <td width="50">
                    <v-simple-checkbox
                      v-model="round.myAvailability"
                      :disabled="round.isHosting || round.isLeading || isPast(round) || !$store.getters.hasPermission('hosting.fillAvailability')"
                      color="accent"
                      :ripple="false"
                      @input="onAvailabilityChange($event, item, round)"
                    ></v-simple-checkbox>
                  </td>
                  <td width="50">
                    <v-simple-checkbox :color="roundColor(round)" :ripple="false" :value="round.isHosting || round.isLeading"></v-simple-checkbox>
                  </td>
                  <td class="hidden-xs-only">{{ round.name }}</td>
                  <td>{{ round.bestOf }}</td>
                  <td>
                    <span class="hidden-xs-only">{{ round.startDate | moment("MMMM DD, YYYY HH:mm") }}</span>
                    <span class="hidden-sm-and-up">{{ round.startDate | moment("MMM DD HH:mm") }}</span>
                  </td>
                  <td class="hidden-xs-only">
                    <span>{{ round.endDate | moment("MMMM DD, YYYY HH:mm") }}</span>
                  </td>
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
        <span class="hidden-sm-and-down">{{ item.startDate | moment("MMMM DD, YYYY HH:mm") }}</span>
        <span class="hidden-md-and-up">{{ item.startDate | moment("MMM DD HH:mm") }}</span>
      </template>
      <template v-slot:item.endDate="{ item }">
        <span class="hidden-sm-and-down">{{ item.endDate | moment("MMMM DD, YYYY HH:mm") }}</span>
        <span class="hidden-md-and-up">{{ item.endDate | moment("MMM DD HH:mm") }}</span>
      </template>
      <template v-slot:footer>
        <div class="v-data-footer">
          <v-spacer></v-spacer>
          <v-btn class="accent--text" text tile @click="getNextTournamentPage" :disabled="allLoaded"> Load more </v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    gameFilters: Array,
    regionFilters: Array
  },
  data() {
    return {
      search: "",
      tournamentsList: [],
      page: 0,
      limit: 15,
      allLoaded: false,
      expanded: [],
      headers: [
        {
          text: "Available / Hosting",
          value: "rounds",
          sortable: false,
          width: 170
        },
        {
          text: "Tournament name",
          align: "start",
          sortable: false,
          value: "name"
        },
        { text: "Game", value: "game", align: "start" },
        {
          text: "Rounds",
          value: "rounds.length",
          align: "center",
          sortable: false
        },
        { text: "Start date", value: "startDate" },
        { text: "End date", value: "endDate" },
        { text: "", value: "data-table-expand", align: "center" }
      ],
      selectedGameFilters: [],
      selectedRegionFilters: [],
      searchTimer: null
    };
  },
  methods: {
    searchTimeout() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }

      this.searchTimer = setTimeout(() => {
        this.changeFilters();
      }, 500);
    },
    changeFilters() {
      this.allLoaded = false;
      this.page = 0;
      this.$http
        .get(
          `${this.APIURL}/tournaments/?limit=${this.limit}&page=${this.page}&search=${encodeURIComponent(this.search)}&games=${
            this.selectedGameFilters
          }&regions=${this.selectedRegionFilters}`
        )
        .then(response => {
          let tournaments = response.data;
          if (tournaments.length < this.limit) this.allLoaded = true;
          tournaments.forEach(tournament => {
            tournament.rounds.forEach(round => {
              round.isHosting = this.isHosting(round);
              round.isLeading = this.isLeading(round);
              round.myAvailability = this.checkAvailability(round);
            });
          });

          this.tournamentsList = tournaments;
        });
    },
    getTournaments() {
      this.$http
        .get(
          `${this.APIURL}/tournaments/?limit=${this.limit}&page=${this.page}&search=${encodeURIComponent(this.search)}&games=${
            this.selectedGameFilters
          }&regions=${this.selectedRegionFilters}`
        )
        .then(response => {
          let tournaments = response.data;
          if (tournaments.length < this.limit) this.allLoaded = true;
          tournaments.forEach(tournament => {
            tournament.rounds.forEach(round => {
              round.isHosting = this.isHosting(round);
              round.isLeading = this.isLeading(round);
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
    isPast(round) {
      return this.$moment(round.endDate).isSameOrBefore(this.$store.state.now);
    },
    checkAvailability(round) {
      return round.available.includes(this.$store.state.user._id);
    },
    tournamentColor(rounds) {
      return rounds.some(round => round.isLeading) ? "blue" : "accent";
    },
    roundColor(round) {
      return round.isLeading ? "blue" : "accent";
    },
    isHosting(round) {
      return round.hosts.some(hostObj => hostObj.host === this.$store.state.user._id);
    },
    isLeading(round) {
      return round.teamLeads.some(TLObj => TLObj.host === this.$store.state.user._id);
    },
    isHostingTournament(rounds) {
      return rounds.some(round => round.isHosting || round.isLeading);
    },
    onAvailabilityChange(value, tournament, round) {
      this.$emit("availabilityChange", { value, tournament, round });
    },
    setTournamentAvailability(value, tournament) {
      for (const round of tournament.rounds) {
        if (round.isHosting || round.isLeading || round.myAvailability === value || this.isPast(round)) continue;
        round.myAvailability = value;
        this.$emit("availabilityChange", { value, tournament, round });
      }
    },
    setFilteredAvailability(value) {
      for (const tournament of this.tournamentsList) {
        this.setTournamentAvailability(value, tournament);
      }
    },
    checkFilteredAvailability() {
      const values = [];
      for (const tournament of this.tournamentsList) {
        const value = tournament.rounds.every(
          round => (!this.isPast(round) && round.myAvailability) || round.isHosting || round.isLeading || this.isPast(round)
        );
        values.push(value);
      }

      return values.every(value => !!value);
    },
    setIcon(tournament) {
      if (tournament.rounds.every(round => (!this.isPast(round) && !round.myAvailability) || this.isPast(round))) return "";
      else if (tournament.rounds.every(round => (!this.isPast(round) && round.myAvailability) || this.isPast(round))) return "mdi-checkbox-marked";
      else return "mdi-minus-box";
    },
    checkTournamentAvailability(tournament) {
      return !!this.setIcon(tournament);
    },
    expand(row) {
      this.expanded.includes(row) ? (this.expanded = this.expanded.filter(expanded => expanded !== row)) : this.expanded.push(row);
    },
    expandAll() {
      if (this.expanded.length === this.tournamentsList.length) {
        this.expanded = [];
      } else {
        this.expanded = this.tournamentsList;
      }
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
.filter-input {
  flex-basis: 0;
}
</style>