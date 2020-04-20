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
            class="table-background mb-4"
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
            <template v-slot:item.name="{ item }">
              <router-link
                :to="`tournaments/${item._id}`"
                class="white--text"
                >{{ item.name }}</router-link
              >
            </template>
            <template v-slot:item.startDate="{ item }">
              <span>{{ $moment(item.startDate).calendar() }}</span>
            </template>
            <template v-slot:item.startsIn="{ item }">
              <span>{{ $moment(item.startDate).from(now) }}</span>
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
            class="table-background"
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
              <span>{{ item.endDate | moment("lll") }}</span>
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
      now: new Date(),
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
        { text: "Game", value: "game", align: "center", width: 200 },
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
  mounted() {
    window.setInterval(() => (this.now = new Date()), 1000 * 60);
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
  },
  watch: {
    $route() {
      this.date = new Date();
    }
  }
};
</script>
