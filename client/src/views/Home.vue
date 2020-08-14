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
          <v-row class="flex-column flex-sm-row" no-gutters>
            <v-col>
              <v-switch v-model="showPastTournaments" label="Show past tournaments" color="accent" class="ma-0" dense></v-switch>
            </v-col>
            <v-col>
              <v-switch v-model="showPastRounds" label="Show past rounds" color="accent" class="ma-0" dense></v-switch>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <ActiveHosted ref="activeHosted" :redirect="redirect" :showPastRounds="showPastRounds" :user="user" :now="now" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <PastHosted v-show="showPastTournaments" ref="pastHosted" :redirect="redirect" :gameFilters="gamesList" :regionFilters="regionsList" />
            </v-col>
          </v-row>
        </v-col>
        <v-col lg="3" cols="12">
          <UsefulLinks :isTeamleader="user.roles.includes('teamleader')" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import UsefulLinks from "../components/Home/UsefulLinks";
import PastHosted from "../components/Home/PastHosted";
import ActiveHosted from "../components/Home/ActiveHosted";

export default {
  props: {
    user: {
      type: Object
    }
  },
  components: {
    UsefulLinks,
    PastHosted,
    ActiveHosted
  },
  data() {
    return {
      admins: [],
      showPastTournaments: false,
      showPastRounds: false,
      gamesList: [],
      regionsList: []
    };
  },
  computed: {
    now() {
      return this.$store.state.now;
    }
  },
  mounted() {
    if (this.user.roles.includes("guest")) {
      this.$http.get(`${this.APIURL}/users/admins`).then(response => {
        this.admins = response.data;
      });
    } else {
      this.$refs.activeHosted.getActiveTournaments();
      this.$refs.pastHosted.getPastTournaments();

      this.$http.get(`${this.APIURL}/collections/games`).then(response => {
        this.gamesList = response.data;
      });

      this.$http.get(`${this.APIURL}/collections/regions`).then(response => {
        this.regionsList = response.data;
      });
    }
  },
  methods: {
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
  tbody {
    display: flex;
    @media screen and (min-width: 960px) {
      display: table-row-group;
    }
  }
  tr:last-of-type > td {
    border-bottom: thin solid rgba(255, 255, 255, 0.12) !important;
    @media screen and (min-width: 960px) {
      border-bottom: none !important;
    }
  }
  th {
    border-bottom: thin solid rgba(255, 255, 255, 0.12);
  }
}
</style>