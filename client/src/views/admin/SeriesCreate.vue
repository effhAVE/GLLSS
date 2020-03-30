<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Create a series
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <v-row>
        <SeriesForm @submit="saveSeries($event)" />
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import SeriesForm from "../../components/Forms/SeriesForm";

export default {
  components: {
    SeriesForm
  },
  methods: {
    saveSeries(series) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .post(`${APIURL}/series/`, series)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Series saved!",
            type: "success"
          });
          this.$router.push("/series");
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