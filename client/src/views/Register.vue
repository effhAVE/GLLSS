<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" color="primary">
          <v-toolbar color="secondary" flat>
            <v-toolbar-title>Registration form</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                name="nickname"
                color="accent"
                placeholder="Nickname"
                v-model="nickname"
                prepend-icon="mdi-account"
                type="text"
                required
              ></v-text-field>
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
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent" class="black--text" large @click="register"
              >Register</v-btn
            >
          </v-card-actions>
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
      nickname: "",
      password: "",
      error: "",
      showError: false
    };
  },
  methods: {
    register: function() {
      let email = this.email;
      let password = this.password;
      let nickname = this.nickname;
      this.$store
        .dispatch("register", { email, password, nickname })
        .then(() => this.$router.push("/"))
        .catch(error => {
          this.$emit("snackbarMessage", {
            message: error.response.data || error,
            type: "error"
          });
        });
    }
  }
};
</script>