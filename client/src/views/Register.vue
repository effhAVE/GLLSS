<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" color="primary">
          <v-toolbar color="secondary" flat>
            <v-toolbar-title>Registration form</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <RegisterForm @submit="register" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import RegisterForm from "../components/Forms/RegisterForm";
export default {
  components: {
    RegisterForm
  },
  methods: {
    register: function({ email, password, nickname }) {
      this.$store
        .dispatch("register", { email, password, nickname })
        .then(() => {
          this.$router.push("/");
          this.$store.commit("snackbarMessage", {
            message: "Verification email sent!",
            type: "success"
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error.data || error,
            type: "error"
          });
        });
    }
  }
};
</script>