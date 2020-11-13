<template>
  <v-app>
    <v-snackbar v-model="snackbar.show" :color="snackbar.type" bottom right multi-line>
      {{ snackbar.message }}
      <v-btn text @click="snackbar.show = false"> Close </v-btn>
    </v-snackbar>
    <v-navigation-drawer v-model="drawer" app clipped color="primary lighten-1" touchless v-if="user">
      <Navigation />
    </v-navigation-drawer>

    <v-app-bar app clipped-left flat color="secondary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title><span class="hidden-xs-only">GLL Staff Scheduler</span><span class="hidden-sm-and-up">GLLSS</span></v-toolbar-title>
      <v-spacer />
      <span>{{ $store.state.now | moment("HH:mm") }}</span>
      <router-link v-if="user" class="accent--text font-weight-bold mx-4" :to="`/me`">
        {{ user.nickname }}
      </router-link>
      <v-btn text v-if="isLoggedIn" @click="logout" class="hidden-xs-only"> Logout </v-btn>
      <v-btn text v-else @click="$router.push('/login')"> Log in </v-btn>
    </v-app-bar>

    <v-content class="primary">
      <keep-alive include="Home, Article">
        <router-view class="pa-md-8 pa-sm-4 pa-0"></router-view>
      </keep-alive>
    </v-content>
    <v-bottom-navigation class="d-sm-none" background-color="primary" color="accent" app shift hide-on-scroll>
      <v-btn to="/">
        <span>Home</span>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn to="/tournaments">
        <span>Tournaments</span>
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-btn>
      <v-btn to="/calendar">
        <span>Calendar</span>
        <v-icon>mdi-calendar</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <v-footer app color="primary darken-1 d-none d-sm-flex">
      <v-spacer />
      <span>Created for GLL by <router-link to="/aboutme">hAVE</router-link> &copy; 2020</span>
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
  created: function () {
    if (this.isLoggedIn) {
      this.$store.dispatch("renewTokenTask");
    }

    this.$http.interceptors.response.use(
      response => response,
      error => {
        const status = error.response ? error.response.status : null;
        if (status === 401 && !error.response.data.type) {
          this.logout();
        } else if (status === 404) {
          this.$router.push("/notfound");
        }

        return error.response;
      }
    );

    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "snackbarMessage") {
        this.snackbar.show = true;
        this.snackbar.message = mutation.payload.message;
        this.snackbar.type = mutation.payload.type;
      }
    });
  },
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn;
    },
    token() {
      return this.$store.state.token;
    },
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
    logout: function () {
      this.$store.dispatch("logout");
    }
  }
};
</script>

<style lang="scss">
.v-application .primary.has-border {
  border: thin solid rgba(255, 255, 255, 0.12) !important;
}

.icon-size {
  width: 24px;
  height: 24px;
  margin: 0 4px;
}
</style>