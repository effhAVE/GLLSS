<template>
  <v-card height="100%" color="transparent" v-if="user">
    <v-card-title>
      Overview
    </v-card-title>
    <v-card-text>
      <div v-if="user.roles.includes('guest')">
        <p>
          Thank you for signing up. Before you continue, you must be confirmed
          by an admin.
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
          <v-switch
            v-model="showPastTournaments"
            label="Show past tournaments"
            color="accent"
          ></v-switch>
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
            :items-per-page="5"
          >
            <template v-slot:item="{ item }">
              <tr class="primary lighten-1">
                <td>
                  <router-link
                    :to="`tournaments/${item._id}`"
                    class="white--text"
                    >{{ item.name }}</router-link
                  >
                </td>
                <td>{{ item.game }}</td>
                <td>{{ $moment(item.startDate).format("MMMM DD HH:mm") }}</td>
                <td>{{ $moment(item.startDate).from(now) }}</td>
              </tr>
              <tr
                class="v-data-table__expanded v-data-table__expanded__content"
              >
                <td :colspan="headersActive.length">
                  <table
                    style="table-layout: fixed;"
                    class="header-borders pa-2"
                  >
                    <thead class="accent--text">
                      <th>Round name</th>
                      <th>Start date</th>
                      <th>Best of</th>
                      <th>Role</th>
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
                          <v-btn
                            icon
                            v-if="!isReady(round)"
                            @click="onReady(item._id, round)"
                            :disabled="readyDisabled(round)"
                          >
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
                <v-btn
                  class="accent--text"
                  text
                  tile
                  @click="getNextActiveTournamentsPage"
                  :disabled="allLoadedActive"
                >
                  Load more
                </v-btn>
              </div>
            </template>
          </v-data-table>
          <h3 class="subtitle" v-show="showPastTournaments">
            Past tournaments
          </h3>
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
            :items-per-page="5"
            v-show="showPastTournaments"
          >
            <template v-slot:item.name="{ item }">
              <router-link
                :to="`tournaments/${item._id}`"
                class="white--text"
                >{{ item.name }}</router-link
              >
            </template>
            <template v-slot:item.endDate="{ item }">
              <span>{{ item.endDate | moment("MMMM DD, YYYY HH:mm") }}</span>
            </template>
            <template v-slot:footer>
              <div class="v-data-footer">
                <v-spacer></v-spacer>
                <v-btn
                  class="accent--text"
                  text
                  tile
                  @click="getNextPastTournamentsPage"
                  :disabled="allLoadedPast"
                >
                  Load more
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-col>
        <v-col cols="3">
          <h3 class="title">Useful links</h3>
          <ul>
            <li>
              <a href="https://help.gll.gg/hc/en-us">GLL Support Site</a>
            </li>
            <li>
              <a href=" https://pubg.seatlon.eu/">PUBG Match/Player Search</a>
            </li>
            <li>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScdXNynI54HnMaT9i0x0DgAdG6JCZIGVI0b69suKA-7G7ig2A/viewform"
                >Cheater Report Form</a
              >
            </li>
            <li>
              <a
                href="https://globalesports.wpengine.com/wp-content/uploads/2020/02/PUBG_Global_Rules-SUPER-v2.0.0.pdf"
                >SUPER Settings 2.0.0</a
              >
            </li>
            <li>
              <a
                href="https://docs.google.com/document/d/1bQuPQxZusipVZH1FvcojBihE8DPR08sHqg2SHJGe4Es/edit"
                >Nations Royale Presets</a
              >
            </li>
            <li>
              <a
                href="https://docs.google.com/spreadsheets/d/1yx3vwJVjyTexO5BTjEEndUDsk_jnBORqlmuCeX-QYTY/edit?usp=sharing"
                >Apex Scrims Seeding Sheet</a
              >
            </li>
            <li>
              <a
                href="https://docs.google.com/spreadsheets/d/1AqXDjsLoXGoVyD6p1RK4h82gZ0kErYCLm3SRFORNU24/edit#gid=798581813"
                >Accounts in use</a
              >
            </li>
            <li>
              <a href="https://forms.gle/CSvPYkJb2dL8XeJ97"
                >Application form for Casters</a
              >
            </li>
          </ul>
          <div v-if="user.roles.includes('teamleader')">
            <h4 class="subtitle">Teamleaders:</h4>
            <ul>
              <li>
                <a
                  href="https://docs.google.com/spreadsheets/d/1k7wSxW9dDpgx46CSHYAxFc_dR1DEXovSEecU_3pkH2s/edit?usp=sharing"
                  >Autochess Seeding Template - 256
                </a>
              </li>
              <li>
                <a
                  href="https://docs.google.com/spreadsheets/d/17W_nAk9P6D_vQqQt_MoFKNUED6KsOYskYQtuYXr5au8/edit?usp=sharing"
                  >Seeding Toby's Tryhard Thursday
                </a>
              </li>
              <li>
                <a
                  href="https://docs.google.com/spreadsheets/d/1fArbNdRzg-RcLdR2JJqmD3_1Z2p5pYxIT1FnvpuXy-M/edit?usp=sharing"
                  >Team Lead Schedule
                </a>
              </li>
              <li>
                <a
                  href="https://docs.google.com/spreadsheets/d/1VGbRvQH0Gwsj3J4QrmAuvD70FnvT0UWN0Zv46YnXCEo/edit#gid=0"
                  >List of Approved Casters
                </a>
              </li>
            </ul>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      admins: [],
      activeHosted: [],
      pastHosted: [],
      allLoadedActive: false,
      allLoadedPast: false,
      limit: 5,
      activeTournamentsPage: 0,
      pastTournamentsPage: 0,
      showPastTournaments: false,
      headersActive: [
        {
          text: "Tournament name",
          align: "start",
          value: "name"
        },
        { text: "Game", value: "game", width: 200 },
        { text: "Start date", value: "startDate" },
        { text: "Starts", value: "startsIn" }
      ],
      headersPast: [
        {
          text: "Tournament name",
          align: "start",
          value: "name"
        },
        { text: "Game", value: "game", align: "center", width: 200 },
        { text: "End date", value: "endDate" }
      ]
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
      return (
        this.$moment(round.startDate).diff(this.now, "minutes") > 60 ||
        this.$moment(round.startDate).diff(this.now, "minutes") < 30
      );
    },
    isLeading(round) {
      return round.teamLeads.some(TLObject => TLObject.host === this.user._id);
    },
    onReady(tournamentID, round) {
      const APIURL = process.env.VUE_APP_APIURL;
      const isLeading = this.isLeading(round);
      let host;
      let source;
      if (isLeading) {
        host = round.teamLeads.find(
          TLObject => TLObject.host === this.user._id
        );
        source = "TL";
      } else {
        host = round.hosts.find(
          hostObject => hostObject.host === this.user._id
        );
        source = "host";
      }

      this.$http
        .post(
          `${APIURL}/tournaments/${tournamentID}/rounds/${round._id}/ready`,
          { source }
        )
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
      const myHost = round.hosts.find(
        hostObject => hostObject.host === this.user._id
      );

      if (myHost) {
        return myHost.ready;
      } else {
        const myTL = round.teamLeads.find(
          TLObject => TLObject.host === this.user._id
        );
        return myTL.ready;
      }
    },
    getActiveTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(
          `${APIURL}/tournaments/hosted?limit=${this.limit}&page=${this.activeTournamentsPage}`
        )
        .then(response => {
          if (response.data.length < this.limit) this.allLoadedActive = true;
          this.activeHosted.push(...response.data);
        });
    },
    getNextActiveTournamentsPage() {
      this.activeTournamentsPage++;
      this.getActiveTournaments();
    },
    getPastTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(
          `${APIURL}/tournaments/hosted?limit=${this.limit}&page=${this.pastTournamentsPage}&past=true`
        )
        .then(response => {
          if (response.data.length < this.limit) this.allLoadedPast = true;
          this.pastHosted.push(...response.data);
        });
    },
    getNextPastTournamentsPage() {
      this.pastTournamentsPage++;
      this.getPastTournaments();
    },
    redirect(tournament) {
      return this.$router
        .push(`/tournaments/${tournament._id}`)
        .catch(err => {});
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