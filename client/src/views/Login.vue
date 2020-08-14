<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="8" md="4" class="pa-2">
        <v-card class="elevation-12 mb-4" color="primary">
          <v-toolbar color="secondary" flat>
            <v-toolbar-title>Sign in to continue</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <LoginForm @submit="login" />
        </v-card>
        <v-dialog v-model="emailVerificationModal" max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn text x-small v-on="on">
              Need verification email?
            </v-btn>
          </template>
          <v-card color="primary">
            <v-toolbar color="secondary" flat>
              <v-toolbar-title>Send verification email</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <EmailForm @submit="sendVerificationEmail" />
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LoginForm from "../components/Forms/LoginForm";
import EmailForm from "../components/Forms/ForgotPasswordForm";
export default {
  components: {
    LoginForm,
    EmailForm
  },
  data() {
    return {
      emailVerificationModal: false
    };
  },
  methods: {
    sendVerificationEmail(email) {
      this.emailVerificationModal = false;

      this.$http
        .post(`${this.APIURL}/users/resend-verification`, { email: email })
        .then(response => {
          if (response.status >= 400) {
            throw new Error(response.data);
          }

          this.$store.commit("snackbarMessage", {
            message: response.data,
            type: "success"
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error,
            type: "error"
          });
        });
    },
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
            message: error.data || error,
            type: "error"
          });
        });
    }
  }
};
</script>