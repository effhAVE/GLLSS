<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Create an account
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <v-row>
        <AccountForm @submit="saveAccount($event)" />
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import AccountForm from "../../components/Forms/AccountForm";

export default {
  components: {
    AccountForm
  },
  methods: {
    saveAccount(account) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .post(`${APIURL}/accounts/`, account)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Account saved!",
            type: "success"
          });
          this.$router.push("/accounts");
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