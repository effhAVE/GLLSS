<template>
  <v-card height="100%" color="transparent" v-if="tournament">
    <v-card-title>
      {{ tournament.name }}
      <v-spacer></v-spacer>
      <v-btn class="success mr-4" v-if="user.roles.includes('admin')">
        Add round
      </v-btn>
      <v-dialog v-model="deleteModal" max-width="500px" overlay-color="primary">
        <template v-slot:activator="{ on }">
          <v-btn class="error" v-if="user.roles.includes('admin')" v-on="on">
            Delete tournament
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text
            >You're about to delete {{ tournament.name }} from the database.
            This action cannot be undone.</v-card-text
          >
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="deleteTournament(tournament._id)">
              Yes
            </v-btn>
            <v-btn color="success" text @click="deleteModal = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>
    <TournamentTable :tournament="tournament" />
    <div class="rounds d-flex align-start flex-wrap">
      <RoundTable
        v-for="round in tournament.rounds"
        :round="round"
        :key="round._id"
        :user="user"
        class="mt-12 mr-12"
      />
    </div>
  </v-card>
</template>

<script>
import TournamentTable from "../../components/TournamentTable";
import RoundTable from "../../components/RoundTable";
export default {
  name: "Tournament",
  components: {
    TournamentTable,
    RoundTable
  },
  props: {
    user: Object
  },
  data() {
    return {
      id: this.$route.params.tournamentID,
      tournament: null,
      loading: true,
      deleteModal: false
    };
  },
  methods: {
    getTournament(id) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/tournaments/${id}`)
        .then(response => {
          this.tournament = response.data;
        })
        .catch(error => {
          if (error.response.status === 404) {
            this.$router.push("/notfound");
          }
        });
    },

    deleteTournament(id) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.deleteModal = false;
      this.$http
        .delete(`${APIURL}/tournaments/${id}`)
        .then(response => {
          this.$emit("snackbarMessage", {
            message: "Tournament successfully deleted!",
            type: "success"
          });
          this.$router.push("/tournaments");
        })
        .catch(error => {
          this.$emit("snackbarMessage", {
            message: "Error while deleting the tournament.",
            type: "error"
          });
        });
    }
  },
  watch: {
    "$route.params": {
      handler(newValue) {
        const { tournamentID } = newValue;
        if (tournamentID) {
          this.getTournament(tournamentID);
        } else {
          this.tournament = null;
        }
      },
      immediate: true
    }
  }
};
</script>