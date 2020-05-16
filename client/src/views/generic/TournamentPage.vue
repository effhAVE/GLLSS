<template>
  <v-card height="100%" color="transparent" v-if="tournament">
    <v-snackbar v-model="changedRounds.length" color="secondary border--accent" bottom right multi-line :timeout="0">
      Do you want to save the changes?
      <v-btn text color="accent" @click="saveRoundsChanges">
        Save
      </v-btn>
    </v-snackbar>
    <v-card-title>
      {{ tournament.name }}
      <v-spacer></v-spacer>
      <v-dialog v-model="addRoundModal" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn class="success mr-4" v-if="user.roles.includes('admin')" v-on="on">
            Add round
          </v-btn>
        </template>
        <v-card class="primary">
          <v-card-text>
            <v-container>
              <RoundForm
                :tournamentDates="{
                  start: tournament.startDate,
                  end: tournament.endDate
                }"
                @cancel="addRoundModal = false"
                @submit="addNewRound($event)"
              />
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="editModal" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn class="success mr-4" v-if="user.roles.includes('admin')" v-on="on">
            Edit tournament
          </v-btn>
        </template>
        <v-card class="primary">
          <v-card-text>
            <v-container>
              <TournamentForm :tournament="tournament" @cancel="editModal = false" @submit="editTournament" />
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteModal" max-width="500px" overlay-color="primary">
        <template v-slot:activator="{ on }">
          <v-btn class="error" v-if="user.roles.includes('admin')" v-on="on">
            Delete tournament
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text>You're about to delete {{ tournament.name }} from the database. This action cannot be undone.</v-card-text>
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
      <Round
        v-for="round in tournament.rounds"
        :round="round"
        :tournamentID="tournament._id"
        :key="round._id"
        :user="user"
        :usersAvailable="usersAvailable"
        :game="tournament.game"
        ref="round"
        class="mt-12 mx-4"
        @roundChanged="changedRounds.push($event)"
      />
    </div>
  </v-card>
</template>

<script>
import TournamentTable from "../../components/TournamentTable";
import Round from "../../components/Rounds/Round";
import RoundForm from "../../components/Forms/RoundForm";
import TournamentForm from "../../components/Forms/TournamentForm";

export default {
  name: "Tournament",
  components: {
    TournamentTable,
    Round,
    RoundForm,
    TournamentForm
  },
  props: {
    user: Object
  },
  data() {
    return {
      id: this.$route.params.tournamentID,
      tournament: null,
      loading: true,
      deleteModal: false,
      addRoundModal: false,
      editModal: false,
      usersAvailable: [],
      changedRounds: []
    };
  },
  methods: {
    getTournament(id) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/tournaments/${id}`)
        .then(response => {
          this.tournament = response.data.tournament;
          const isPast = response.data.isPast;
          if (isPast && this.user.roles.includes("teamleader")) {
            this.$http.get(`${APIURL}/users/list`).then(response => {
              this.usersAvailable = response.data;
            });
          }
        })
        .catch(error => {
          if (error.response.status === 400) {
            this.$router.push("/notfound");
          }
        });
    },
    saveRoundsChanges() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .put(`${APIURL}/tournaments/${this.tournament._id}/rounds`, this.changedRounds)
        .then(() => {
          this.changedRounds.splice(0);
          this.$store.commit("snackbarMessage", {
            message: "Rounds updated!",
            type: "success"
          });
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: "Error while saving rounds.",
            type: "error"
          })
        );
    },
    addNewRound(round) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.addRoundModal = false;
      this.$http
        .post(`${APIURL}/tournaments/${this.tournament._id}/rounds`, round)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Round added!",
            type: "success"
          });
          this.$router.go();
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while deleting the tournament.",
            type: "error"
          });
        });
    },

    deleteTournament(id) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.deleteModal = false;
      this.$http
        .delete(`${APIURL}/tournaments/${id}`)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Tournament successfully deleted!",
            type: "success"
          });
          this.$router.push("/tournaments");
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while deleting the tournament.",
            type: "error"
          });
        });
    },
    editTournament(tournament) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.editModal = false;
      this.$http
        .put(`${APIURL}/tournaments/${tournament._id}`, tournament)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Tournament successfully edited!",
            type: "success"
          });
          this.$router.go();
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while editing the tournament.",
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
