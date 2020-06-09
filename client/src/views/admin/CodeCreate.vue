<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Create a code
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <v-row>
        <CodeForm @submit="saveCode($event)" />
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import CodeForm from "../../components/Forms/CodeForm";
export default {
  components: {
    CodeForm
  },
  methods: {
    saveCode(code) {
      this.$http
        .post(`${this.APIURL}/codes/`, code)
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.$store.commit("snackbarMessage", {
            message: "Code saved!",
            type: "success"
          });
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: error || "Error while saving",
            type: "error"
          })
        );
    }
  }
};
</script>