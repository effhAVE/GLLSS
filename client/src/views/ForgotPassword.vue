<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" color="primary">
          <v-toolbar color="secondary" flat>
            <v-toolbar-title>Reset your password</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <ForgotPasswordForm @submit="sendResetEmail" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ForgotPasswordForm from "../components/Forms/ForgotPasswordForm";
export default {
  components: {
    ForgotPasswordForm
  },
  methods: {
    sendResetEmail(email) {
      this.$http
        .post(`${this.APIURL}/auth/forgot-password`, { email: email })
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.$store.commit("snackbarMessage", {
            message: "Email sent!",
            type: "success"
          });

          this.$router.push("/login");
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error,
            type: "error"
          });
        });
    }
  }
};
</script>