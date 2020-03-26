<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" color="primary">
          <v-toolbar color="secondary" flat>
            <v-toolbar-title>Sign in to continue</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-form>
            <v-card-text>
              <v-text-field
                name="email"
                color="accent"
                placeholder="Email"
                v-model="email"
                prepend-icon="mdi-email"
                type="text"
                required
              ></v-text-field>

              <v-text-field
                id="password"
                color="accent"
                placeholder="Password"
                v-model="password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <p class="mb-0">
                No account? <a href="/register"> Register now!</a>
              </p>
              <v-spacer></v-spacer>
              <v-btn
                color="accent"
                class="black--text"
                large
                type="submit"
                @click.prevent="login"
                >Sign in</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      error: ""
    };
  },
  methods: {
    login: function() {
      let email = this.email;
      let password = this.password;
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