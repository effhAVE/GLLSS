<template>
  <div>
    <h3 class="subtitle accent--text">Upcoming tournaments</h3>
    <v-data-table
      class="table-background mb-4 not-editable headers--accent"
      :items="activeHosted"
      :headers="headers"
      @click:row="redirect"
      no-data-text="You're not hosting any tournaments"
      item-key="_id"
      hide-default-footer
      disable-pagination
      disable-sort
      mobile-breakpoint="0"
    >
      <template v-slot:item="{ item }">
        <tr class="primary lighten-1">
          <td>
            <router-link :to="`tournaments/${item._id}`" class="white--text">{{ item.name }}</router-link>
          </td>
          <td>{{ item.game }}</td>
          <td>{{ item.region }}</td>
        </tr>
        <tr>
          <td :colspan="headers.length" class="pa-0 pa-sm-2">
            <table style="table-layout: fixed" class="header-borders px-0 pt-2 pa-sm-2 d-flex d-md-table">
              <thead class="accent--text">
                <th class="hidden-md-and-down d-md-table-cell">Round name</th>
                <th class="hidden-xs-only d-sm-flex align-center justify-center d-md-table-cell">Start date</th>
                <th class="hidden-xs-only d-sm-flex align-center justify-center d-md-table-cell">Best of</th>
                <th class="hidden-md-and-down d-md-table-cell">Role</th>
                <th class="hidden-xs-only d-sm-flex align-center justify-center d-md-table-cell">Group</th>
                <th class="hidden-md-and-down d-md-table-cell">Prep time</th>
                <th class="hidden-xs-only d-sm-flex align-center justify-center d-md-table-cell">Ready</th>
                <th class="hidden-md-and-down d-md-table-cell">Starts</th>
              </thead>
              <tbody class="flex-grow-1 flex-md-column">
                <tr v-for="round in item.rounds" :key="round._id" class="d-md-table-row d-table-cell flex-grow-1 text-center text-md-left">
                  <td class="hidden-md-and-down d-md-table-cell">{{ round.name }}</td>
                  <td class="d-flex align-center justify-center d-md-table-cell">
                    <span class="hidden-xs-only">{{ $moment(round.startDate).format("MMMM DD HH:mm") }}</span>
                    <span class="hidden-sm-and-up">{{ $moment(round.startDate).format("MMM DD HH:mm") }}</span>
                  </td>
                  <td class="d-flex align-center justify-center d-md-table-cell"><span class="hidden-sm-and-up">BO </span>{{ round.bestOf }}</td>
                  <td class="hidden-md-and-down d-md-table-cell">
                    <span v-if="isLeading(round)" class="blue--text"> teamlead </span>
                    <span v-else> host </span>
                  </td>
                  <td class="d-flex align-center justify-center d-md-table-cell">
                    <div v-if="!isLeading(round)">
                      <span v-if="item.game !== 'Autochess'">{{
                        myHost(round).groupName.replace("index", round.hosts.indexOf(myHost(round)) + 1)
                      }}</span>
                      <span v-else>
                        {{
                          myHost(round).groupName.replace(
                            "index",
                            `${round.hosts.indexOf(myHost(round)) * 4 + 1}-${round.hosts.indexOf(myHost(round)) * 4 + 4}`
                          )
                        }}
                      </span>
                    </div>
                  </td>
                  <td class="hidden-md-and-down d-md-table-cell">
                    <span v-if="isLeading(round)">{{ round.prepTime }} minutes</span>
                  </td>
                  <td class="d-flex align-center justify-center d-md-table-cell">
                    <v-btn icon v-if="lostLeadingOrHosting(round)">
                      <v-icon color="warning"> mdi-account-off </v-icon>
                    </v-btn>
                    <v-btn icon v-else-if="!isReady(round)" @click="onReady(item._id, round)" :disabled="readyDisabled(round)">
                      <v-icon color="error"> mdi-account-off </v-icon>
                    </v-btn>
                    <v-btn icon v-else>
                      <v-icon color="success"> mdi-account-check </v-icon>
                    </v-btn>
                  </td>
                  <td class="hidden-md-and-down d-md-table-cell">
                    {{ $moment(round.startDate).from(now) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </template>
      <template v-slot:footer>
        <div class="v-data-footer">
          <v-spacer></v-spacer>
          <v-btn class="accent--text" text tile @click="getNextTournamentsPage" :disabled="allLoaded"> Load more </v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    redirect: Function,
    showPastRounds: Boolean,
    now: Date
  },
  data() {
    return {
      activeHosted: [],
      allLoaded: false,
      limit: this.$store.state.preferences.overviewTournamentsLimitActive || 5,
      page: 0,
      headers: [
        {
          text: "Tournament name",
          align: "start",
          value: "name"
        },
        { text: "Game", value: "game" },
        { text: "Region", value: "region" }
      ]
    };
  },
  watch: {
    showPastRounds(value) {
      this.getPastRounds();
    }
  },
  methods: {
    readyDisabled(round) {
      let checkInStart = 60;
      if (this.isLeading(round)) checkInStart += 30;
      return this.$moment(round.startDate).diff(this.now, "minutes") > checkInStart || this.$moment(round.startDate).diff(this.now, "minutes") < 30;
    },
    isLeading(round) {
      return round.teamLeads.some(TLObject => TLObject.host === this.$store.state.user._id);
    },
    myHost(round) {
      return round.hosts.find(hostObject => hostObject.host === this.$store.state.user._id);
    },
    myLead(round) {
      return round.teamLeads.find(TLObject => TLObject.host === this.$store.state.user._id);
    },
    lostLeadingOrHosting(round) {
      const host = this.myHost(round);
      const lead = this.myLead(round);
      if (host) {
        return host.lostHosting;
      } else if (lead) {
        return lead.lostLeading;
      }
    },
    onReady(tournamentID, round) {
      const isLeading = this.isLeading(round);
      let host;
      let source;
      if (isLeading) {
        host = round.teamLeads.find(TLObject => TLObject.host === this.$store.state.user._id);
        source = "TL";
      } else {
        host = round.hosts.find(hostObject => hostObject.host === this.$store.state.user._id);
        source = "host";
      }

      this.$http
        .post(`${this.APIURL}/tournaments/${tournamentID}/rounds/${round._id}/ready`, { source })
        .then(response => {
          host.ready = true;
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error.response.data || "Error while updating."
          });
        });
    },
    isReady(round) {
      const myHost = this.myHost(round);

      if (myHost) {
        return myHost.ready;
      } else {
        const myTL = round.teamLeads.find(TLObject => TLObject.host === this.$store.state.user._id);
        return myTL.ready;
      }
    },
    getActiveTournaments() {
      this.$http.get(`${this.APIURL}/tournaments/hosted?limit=${this.limit}&page=${this.page}&showPast=${this.showPastRounds}`).then(response => {
        if (response.data.length < this.limit) this.allLoaded = true;
        this.activeHosted.push(...response.data);
      });
    },
    getPastRounds() {
      this.page = 0;
      this.allLoaded = false;
      this.$http.get(`${this.APIURL}/tournaments/hosted?limit=${this.limit}&page=${this.page}&showPast=${this.showPastRounds}`).then(response => {
        if (response.data.length < this.limit) this.allLoaded = true;
        this.activeHosted = response.data;
      });
    },
    getNextTournamentsPage() {
      this.page++;
      this.getActiveTournaments();
    }
  }
};
</script>