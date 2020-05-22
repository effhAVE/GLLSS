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
          <td :colspan="headers.length">
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
          <v-btn class="accent--text" text tile @click="getNextTournamentsPage" :disabled="allLoaded">
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
    redirect: Function,
    showPastRounds: Boolean,
    user: Object,
    now: Date
  },
  data() {
    return {
      activeHosted: [],
      allLoaded: false,
      limit: 5,
      page: 0,
      headers: [
        {
          text: "Tournament name",
          align: "start",
          value: "name"
        },
        { text: "Game", value: "game", width: 200 },
        { text: "Region", value: "region", width: 200 }
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
      this.$http.get(`${APIURL}/tournaments/hosted?limit=${this.limit}&page=${this.page}&showPast=${this.showPastRounds}`).then(response => {
        if (response.data.length < this.limit) this.allLoaded = true;
        this.activeHosted.push(...response.data);
      });
    },
    getPastRounds() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.page = 0;
      this.allLoaded = false;
      this.$http.get(`${APIURL}/tournaments/hosted?limit=${this.limit}&page=${this.page}&showPast=${this.showPastRounds}`).then(response => {
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