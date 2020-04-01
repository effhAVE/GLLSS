<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" color="primary">
          <v-toolbar color="secondary" flat>
            <v-toolbar-title>Sign in to continue</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <LoginForm @submit="login" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LoginForm from "../components/Forms/LoginForm";
export default {
  components: {
    LoginForm
  },
  methods: {
    login({ email, password }) {
      this.$store
        .dispatch("login", { email, password })
        .then(() => {
          this.$router.push("/");
          this.$store.commit("snackbarMessage", {
            message: "Successfully logged in.",
            type: "success"
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error.response.data,
            type: "error"
          });
        });
    }
  }
};
</script>