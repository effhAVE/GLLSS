<template>
  <v-card height="100%" color="transparent" v-if="user">
    <v-card-title>
      Overview
    </v-card-title>
    <v-card-text>
      <div v-if="user.roles.includes('guest')">
        <p>
          Thank you for signing up. Before you continue, you must be confirmed by an admin.
        </p>
        <p>
          Here is the list of current admins:
        </p>
        <ul v-for="admin in admins" :key="admin._id">
          <li>{{ admin.nickname }}</li>
        </ul>
      </div>
      <v-row v-else>
        <v-col>
          <v-row>
            <v-switch v-model="showPastTournaments" label="Show past tournaments" color="accent"></v-switch>
            <v-switch v-model="showPastRounds" @change="getPastRounds" label="Show past rounds" color="accent" class="mx-8"></v-switch>
          </v-row>
          <h3 class="subtitle accent--text">Upcoming tournaments</h3>
          <v-data-table
            class="table-background mb-4 not-editable headers--accent"
            :items="activeHosted"
            :headers="headersActive"
            @click:row="redirect"
            no-data-text="You're not hosting any tournaments"
            item-key="_id"
            hide-default-footer
            disable-pagination
            disable-sort
          >
            <template v-slot:item="{ item }">
              <tr class="primary lighten-1">
                <td>
                  <router-link :to="`tournaments/${item._id}`" class="white--text">{{ item.name }}</router-link>
                </td>
                <td>{{ item.game }}</td>
                <td>{{ item.region }}</td>
              </tr>
              <tr class="v-data-table__expanded v-data-table__expanded__content">
                <td :colspan="headersActive.length">
                  <table style="table-layout: fixed;" class="header-borders pa-2">
                    <thead class="accent--text">
                      <th>Round name</th>
                      <th>Start date</th>
                      <th>Best of</th>
                      <th>Role</th>
                      <th>Group</th>
                      <th>Ready</th>
                      <th>Starts</th>
                    </thead>
                    <tbody>
                      <tr v-for="round in item.rounds" :key="round._id">
                        <td>{{ round.name }}</td>
                        <td>
                          {{ $moment(round.startDate).format("MMMM DD HH:mm") }}
                        </td>
                        <td>{{ round.bestOf }}</td>
                        <td>
                          <span v-if="isLeading(round)" class="blue--text">
                            teamlead
                          </span>
                          <span v-else>
                            host
                          </span>
                        </td>
                        <td>
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
                        <td>
                          <v-btn icon v-if="lostLeadingOrHosting(round)">
                            <v-icon color="warning">
                              mdi-account-off
                            </v-icon>
                          </v-btn>
                          <v-btn icon v-else-if="!isReady(round)" @click="onReady(item._id, round)" :disabled="readyDisabled(round)">
                            <v-icon color="error">
                              mdi-account-off
                            </v-icon>
                          </v-btn>
                          <v-btn icon v-else>
                            <v-icon color="success">
                              mdi-account-check
                            </v-icon>
                          </v-btn>
                        </td>
                        <td>
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
                <v-btn class="accent--text" text tile @click="getNextActiveTournamentsPage" :disabled="allLoadedActive">
                  Load more
                </v-btn>
              </div>
            </template>
          </v-data-table>
          <v-row v-show="showPastTournaments" class="ma-0 mt-12">
            <h3 class="subtitle">
              Past tournaments
            </h3>
            <v-spacer></v-spacer>
            <v-select
              :items="pastFilters"
              v-model="selectedPastFilter"
              @change="changePastFilters"
              label="Filter"
              outlined
              dense
              color="accent"
            ></v-select>
          </v-row>

          <v-data-table
            class="table-background not-editable"
            :items="pastHosted"
            :headers="headersPast"
            @click:row="redirect"
            no-data-text="You haven't hosted any tournament"
            item-key="_id"
            hide-default-footer
            disable-pagination
            disable-sort
            :items-per-page="limitPast"
            v-show="showPastTournaments"
          >
            <template v-slot:item.name="{ item }">
              <router-link :to="`tournaments/${item._id}`" class="white--text">{{ item.name }}</router-link>
            </template>
            <template v-slot:item.endDate="{ item }">
              <span>{{ item.endDate | moment("MMMM DD, YYYY HH:mm") }}</span>
            </template>
            <template v-slot:footer>
              <div class="v-data-footer">
                <v-spacer></v-spacer>
                <v-btn class="accent--text" text tile @click="getNextPastTournamentsPage" :disabled="allLoadedPast">
                  Load more
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-col>
        <v-col cols="3">
          <UsefulLinks :isTeamleader="user.roles.includes('teamleader')" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import UsefulLinks from "../components/Home/UsefulLinks";

export default {
  props: {
    user: {
      type: Object
    }
  },
  components: {
    UsefulLinks
  },
  data() {
    return {
      admins: [],
      activeHosted: [],
      pastHosted: [],
      allLoadedActive: false,
      allLoadedPast: false,
      limitActive: 5,
      limitPast: 10,
      activeTournamentsPage: 0,
      pastTournamentsPage: 0,
      showPastTournaments: false,
      showPastRounds: false,
      headersActive: [
        {
          text: "Tournament name",
          align: "start",
          value: "name"
        },
        { text: "Game", value: "game", width: 200 },
        { text: "Region", value: "region", width: 200 }
      ],
      headersPast: [
        {
          text: "Tournament name",
          align: "start",
          value: "name"
        },
        { text: "Game", value: "game", align: "center", width: 200 },
        { text: "Region", value: "region", width: 200 },
        { text: "End date", value: "endDate" }
      ],
      pastFilters: [
        {
          text: "All",
          value: ""
        },
        {
          text: "Lost hosting/leading",
          value: "lost"
        },
        {
          text: "Hosted",
          value: "hosted"
        }
      ],
      selectedPastFilter: ""
    };
  },
  computed: {
    now() {
      return this.$store.state.now;
    }
  },
  mounted() {
    const APIURL = process.env.VUE_APP_APIURL;
    if (this.user.roles.includes("guest")) {
      this.$http.get(`${APIURL}/users/admins`).then(response => {
        this.admins = response.data;
      });
    } else {
      this.getActiveTournaments();
      this.getPastTournaments();
    }
  },
  methods: {
    readyDisabled(round) {
      return this.$moment(round.startDate).diff(this.now, "minutes") > 60 || this.$moment(round.startDate).diff(this.now, "minutes") < 30;
    },
    isLeading(round) {
      return round.teamLeads.some(TLObject => TLObject.host === this.user._id);
    },
    myHost(round) {
      return round.hosts.find(hostObject => hostObject.host === this.user._id);
    },
    myLead(round) {
      return round.teamLeads.find(TLObject => TLObject.host === this.user._id);
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
      const APIURL = process.env.VUE_APP_APIURL;
      const isLeading = this.isLeading(round);
      let host;
      let source;
      if (isLeading) {
        host = round.teamLeads.find(TLObject => TLObject.host === this.user._id);
        source = "TL";
      } else {
        host = round.hosts.find(hostObject => hostObject.host === this.user._id);
        source = "host";
      }

      this.$http
        .post(`${APIURL}/tournaments/${tournamentID}/rounds/${round._id}/ready`, { source })
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
        const myTL = round.teamLeads.find(TLObject => TLObject.host === this.user._id);
        return myTL.ready;
      }
    },
    getActiveTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/tournaments/hosted?limit=${this.limitActive}&page=${this.activeTournamentsPage}&showPast=${this.showPastRounds}`)
        .then(response => {
          if (response.data.length < this.limitActive) this.allLoadedActive = true;
          this.activeHosted.push(...response.data);
        });
    },
    getPastRounds() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.activeTournamentsPage = 0;
      this.allLoadedActive = false;
      this.$http
        .get(`${APIURL}/tournaments/hosted?limit=${this.limitActive}&page=${this.activeTournamentsPage}&showPast=${this.showPastRounds}`)
        .then(response => {
          if (response.data.length < this.limitActive) this.allLoadedActive = true;
          this.activeHosted = response.data;
        });
    },
    getNextActiveTournamentsPage() {
      this.activeTournamentsPage++;
      this.getActiveTournaments();
    },
    getPastTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/tournaments/hosted/past?limit=${this.limitPast}&page=${this.pastTournamentsPage}&pastFilter=${this.selectedPastFilter}`)
        .then(response => {
          if (response.data.length < this.limitPast) this.allLoadedPast = true;
          this.pastHosted.push(...response.data);
        });
    },
    changePastFilters() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.allLoadedPast = false;
      this.pastTournamentsPage = 0;
      this.$http
        .get(`${APIURL}/tournaments/hosted/past?limit=${this.limitPast}&page=${this.pastTournamentsPage}&pastFilter=${this.selectedPastFilter}`)
        .then(response => {
          if (response.data.length < this.limitPast) this.allLoadedPast = true;
          this.pastHosted = response.data;
        });
    },
    getNextPastTournamentsPage() {
      this.pastTournamentsPage++;
      this.getPastTournaments();
    },
    redirect(tournament) {
      return this.$router.push(`/tournaments/${tournament._id}`).catch(err => {});
    }
  }
};
</script>
<style lang="scss">
.headers--accent.theme--dark.v-data-table thead tr th {
  color: var(--v-accent-base);
}
.header-borders {
  tr:last-of-type > td {
    border-bottom: none !important;
  }
  th {
    border-bottom: thin solid rgba(255, 255, 255, 0.12);
  }
}
</style>