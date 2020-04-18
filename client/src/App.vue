<template>
  <v-app>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.type"
      bottom
      right
      multi-line
    >
      {{ snackbar.message }}
      <v-btn text @click="snackbar.show = false">
        Close
      </v-btn>
    </v-snackbar>
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      color="primary lighten-1"
      v-if="user"
    >
      <Navigation :user="user" />
    </v-navigation-drawer>

    <v-app-bar app clipped-left flat color="secondary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>GLL Staff Scheduler</v-toolbar-title>
      <v-spacer />
      <span v-if="user" class="accent--text font-weight-bold mr-4">
        {{ user.nickname }}
      </span>
      <v-btn text v-if="isLoggedIn" @click="logout">
        Logout
      </v-btn>
      <v-btn text v-else @click="$router.push('/login')">
        Log in
      </v-btn>
    </v-app-bar>

    <v-content class="primary">
      <keep-alive include="Home">
        <router-view class="pa-8" :user="user"></router-view>
      </keep-alive>
    </v-content>

    <v-footer app color="primary darken-1">
      <v-spacer />
      <span>Created for GLL by <a href="#">hAVE</a> &copy; 2020</span>
      <v-spacer />
    </v-footer>
  </v-app>
</template>

<script>
import Navigation from "./components/Navigation";
export default {
  components: {
    Navigation
  },
  data: () => ({
    drawer: null,
    snackbar: {
      show: false,
      type: "",
      message: ""
    }
  }),
  created: function() {
    this.$http.interceptors.response.use(
      response => response,
      error => {
        const status = error.response ? error.response.status : null;
        return new Promise((resolve, reject) => {
          if (status === 401) {
            this.$store.dispatch("logout");
          } else if (status === 404) {
            this.$router.push("/notfound");
          }
          throw error;
        });
      }
    );

    if (this.isLoggedIn) {
      this.$store.dispatch("renewTokenTask");
    }

    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "snackbarMessage") {
        this.snackbar.show = true;
        this.snackbar.message = mutation.payload.message;
        this.snackbar.type = mutation.payload.type;
      }
    });
  },
  computed: {
    isLoggedIn: function() {
      return this.$store.getters.isLoggedIn;
    },
    token() {
      return this.$store.state.token;
    },
    user() {
      return this.$jwt.decode(this.token);
    }
  },
  methods: {
    logout: function() {
      this.$store.dispatch("logout");
    }
  }
};
</script>

<style lang="scss">
html {
  overflow-y: auto !important;
}

.v-application .primary.has-border {
  border: thin solid rgba(255, 255, 255, 0.12) !important;
}

.icon-size {
  width: 24px;
  height: 24px;
  margin: 0 4px;
}
</style>