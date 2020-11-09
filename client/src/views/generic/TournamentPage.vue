<template>
  <v-card height="100%" color="transparent" v-if="tournament">
    <v-snackbar v-model="changedRounds.length" color="secondary border--accent" bottom right multi-line :timeout="0">
      Do you want to save the changes?
      <v-btn text color="accent" @click="saveRoundsChanges"> Save </v-btn>
    </v-snackbar>
    <v-card-title>
      {{ tournament.name }}
      <v-spacer></v-spacer>
      <v-dialog v-model="addRoundModal" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn class="success mr-4" v-if="$store.getters.hasPermission('rounds.create')" v-on="on"> Add round </v-btn>
        </template>
        <v-card class="primary">
          <v-card-text>
            <v-container>
              <RoundForm
                :tournamentDates="tournamentDates(tournament)"
                :prevRound="tournament.rounds[tournament.rounds.length - 1]"
                @cancel="addRoundModal = false"
                @submit="addNewRound($event)"
              />
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="editModal" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn class="success mr-4" v-if="$store.getters.hasPermission('tournaments.update')" v-on="on"> Edit tournament </v-btn>
        </template>
        <v-card class="primary">
          <v-card-text>
            <v-container>
              <TournamentForm :tournament="tournament" @cancel="editModal = false" @submit="editTournament" :copy="false" />
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="copyModal" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn class="accent darken-1 mr-4" v-if="$store.getters.hasPermission('tournaments.copy')" v-on="on"> Copy tournament </v-btn>
        </template>
        <v-card class="primary">
          <v-card-text>
            <v-container>
              <TournamentForm :tournament="tournament" @cancel="copyModal = false" @submit="copyTournament" :copy="true" />
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteModal" max-width="500px" overlay-color="primary">
        <template v-slot:activator="{ on }">
          <v-btn class="error" v-if="$store.getters.hasPermission('tournaments.delete')" v-on="on"> Delete tournament </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text>You're about to delete {{ tournament.name }} from the database. This action cannot be undone.</v-card-text>
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="deleteTournament(tournament._id)"> Yes </v-btn>
            <v-btn color="success" text @click="deleteModal = false"> Cancel </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>
    <TournamentTable :tournament="tournament" :cost="tournamentCost" />
    <div class="rounds d-flex align-start flex-wrap" v-if="$store.getters.hasPermission('rounds.view')">
      <Round
        v-for="round in tournament.rounds"
        :round="round"
        :tournamentID="tournament._id"
        :key="round._id"
        :user="user"
        :usersAvailable="usersAvailable"
        :game="tournament.game"
        :isPast="$moment(round.endDate).isSameOrBefore($moment($store.state.now))"
        ref="round"
        class="mt-12 mx-4"
        @roundChanged="changedRounds.push($event)"
        @pastAvailabilityEdited="usersAvailable = $event"
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
      copyModal: false,
      usersAvailable: [],
      changedRounds: [],
      gameValues: null,
      TLRatio: 100
    };
  },
  computed: {
    tournamentCost() {
      let hostCost = 0;
      let TLCost = 0;
      if (!this.gameValues) return { TL: "Error", host: "Error" };
      this.tournament.rounds.forEach(round => {
        round.hosts.forEach(hostObject => {
          hostObject.lostHosting
            ? (hostCost += 0)
            : (hostCost += this.gameValues[this.tournament.game] * (round.bestOf + (+hostObject.timeBalance || 0)));
        });

        round.teamLeads.forEach(TLObject => {
          let TLTime;
          if (TLObject.lostLeading) {
            TLTime = 0;
          } else {
            TLTime = this.$moment(round.endDate)
              .add(TLObject.timeBalance, "minutes")
              .diff(this.$moment(round.startDate).subtract(round.prepTime, "minutes"), "minutes");
          }

          TLCost += (TLTime / 60) * this.TLRatio;
        });
      });

      return { TL: Number(TLCost.toFixed(0)), host: Number(hostCost.toFixed(0)) };
    }
  },
  mounted() {
    this.$http
      .get(`${this.APIURL}/data/recentvalues`)
      .then(response => {
        this.gameValues = response.data.gameValues;
        this.TLRatio = response.data.TLRatio || 100;
      })
      .catch(error => {
        this.$store.commit("snackbarMessage", {
          type: "error",
          message: "No game values found. Cost cannot be calculated."
        });
      });
  },
  methods: {
    tournamentDates(tournament) {
      const roundsLength = tournament.rounds.length;
      return {
        start: tournament.startDate,
        end: tournament.endDate
      };
    },
    getTournament(id) {
      this.$http
        .get(`${this.APIURL}/tournaments/${id}`)
        .then(response => {
          this.tournament = response.data.tournament;
          if (this.$store.getters.hasAnyPermission(["hosts.add", "teamLeads.add"])) {
            this.$http.get(`${this.APIURL}/users/list`).then(response => {
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
      const changes = Array.from(this.changedRounds);
      this.changedRounds.splice(0);
      this.$http
        .put(`${this.APIURL}/tournaments/${this.tournament._id}/rounds`, changes)
        .then(() => {
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
      this.addRoundModal = false;
      this.$http
        .post(`${this.APIURL}/tournaments/${this.tournament._id}/rounds`, round)
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
      this.deleteModal = false;
      this.$http
        .delete(`${this.APIURL}/tournaments/${id}`)
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
      this.editModal = false;
      this.$http
        .put(`${this.APIURL}/tournaments/${tournament._id}`, tournament)
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
    },
    copyTournament(tournament) {
      this.copyModal = false;
      const { name, series, game, startDate, endDate, region, countedByRounds, gllURL, rounds } = tournament;
      const newTournament = { name, series, game, startDate, endDate, region, countedByRounds, gllURL, rounds };
      this.$http
        .post(`${this.APIURL}/tournaments/`, newTournament)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Tournament successfully copied!",
            type: "success"
          });
          this.$router.push(`/tournaments/${response.data._id}`);
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while copying the tournament.",
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
