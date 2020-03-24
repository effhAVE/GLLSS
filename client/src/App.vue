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
      <v-list dense>
        <v-list-item link to="/">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Overview</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/tournaments">
          <v-list-item-action>
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Tournaments</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-group
          prepend-icon="mdi-shield-account"
          color="accent"
          v-if="user.roles.includes(`admin`)"
          :value="$route.path.includes('admin')"
        >
          <template v-slot:activator>
            <v-list-item-title>Admin</v-list-item-title>
          </template>
          <v-list-item link to="/admin/users">
            <v-list-item-content>
              <v-list-item-title>Users</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link to="/admin/unconfirmed">
            <v-list-item-content>
              <v-list-item-title>Confirm users</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link to="/admin/tournaments/create">
            <v-list-item-content>
              <v-list-item-title>Create a tournament</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left flat color="secondary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>GLL Staff Scheduler</v-toolbar-title>
      <v-spacer />
      <span v-if="user" class="accent--text font-weight-bold mr-4">{{
        user.nickname
      }}</span>
      <v-btn text v-if="isLoggedIn" @click="logout">
        Logout
      </v-btn>
      <v-btn text v-else @click="$router.push('/login')">
        Log in
      </v-btn>
    </v-app-bar>

    <v-content class="primary">
      <router-view
        class="pa-8"
        :user="user"
        @snackbarMessage="onSnackbar($event)"
      ></router-view>
    </v-content>

    <v-footer app color="primary darken-1">
      <v-spacer />
      <span>Created for GLL by <a href="#">hAVE</a> &copy; 2020</span>
      <v-spacer />
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: null,
    snackbar: {
      show: false,
      type: "",
      message: ""
    }
  }),
  created: function() {
    /* if (!this.user && this.isLoggedIn) {
      this.$store.dispatch("getUserData");
      console.log(this.$jwt.decode());
    } */
    this.$http.interceptors.response.use(
      response => response,
      function(error) {
        const status = error.response ? error.response.status : null;
        return new Promise(function(resolve, reject) {
          if (status === 401) {
            this.$store.dispatch("logout");
          }

          throw error;
        });
      }
    );
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
      this.$store.dispatch("logout").then(() => {
        this.$router.push("/login");
      });
    },
    onSnackbar({ message, type }) {
      this.snackbar.show = true;
      this.snackbar.message = message;
      this.snackbar.type = type;
    }
  }
};
</script>

<style lang="scss">
</style>