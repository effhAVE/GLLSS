<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Create a data month
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <v-row>
        <DataMonthForm @submit="saveDataMonth" />
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import DataMonthForm from "../../components/Forms/DataMonthForm";

export default {
  components: {
    DataMonthForm
  },
  methods: {
    saveDataMonth(date) {
      this.$http
        .post(`${this.APIURL}/data/`, { date: date })
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Data month saved!",
            type: "success"
          });
          this.$router.push("/data");
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