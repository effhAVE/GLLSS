<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" color="primary">
          <v-toolbar color="secondary" flat>
            <v-toolbar-title>Reset your password</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <PasswordResetForm @submit="resetPassword" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import PasswordResetForm from "../components/Forms/PasswordResetForm";
export default {
  components: {
    PasswordResetForm
  },
  data() {
    return {
      token: this.$route.query.token
    };
  },
  methods: {
    resetPassword(password) {
      this.$http
        .post(`${this.APIURL}/auth/password-reset`, {
          password,
          token: this.token
        })
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Password saved, you can now log in using the new one!",
            type: "success"
          });

          this.$router.push("/login");
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Invalid token.",
            type: "error"
          });
        });
    }
  },
  created() {
    if (!this.token) {
      this.$router.push("/notfound");
    }
  }
};
</script>