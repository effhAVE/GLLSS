<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Create a tournament
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <v-row>
        <TournamentForm @submit="saveTournament($event)" />
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import TournamentForm from "../../components/Forms/TournamentForm";

export default {
  components: {
    TournamentForm
  },
  methods: {
    saveTournament(tournament) {
      this.$http
        .post(`${this.APIURL}/tournaments/`, tournament)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Tournament saved!",
            type: "success"
          });
          this.$router.push("/tournaments");
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: error.response.data || "Error while saving",
            type: "error"
          })
        );
    }
  }
};
</script>