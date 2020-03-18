<template>
  <v-app>
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
        >
          <template v-slot:activator>
            <v-list-item-title>Admin</v-list-item-title>
          </template>
          <v-list-item link to="/admin/users/unconfirmed">
            <v-list-item-content>
              <v-list-item-title>Confirm users</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link to="/admin2">
            <v-list-item-content>
              <v-list-item-title>Tournaments setup</v-list-item-title>
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
        user.name
      }}</span>
      <v-btn text v-if="isLoggedIn" @click="logout">
        Logout
      </v-btn>
    </v-app-bar>

    <v-content class="primary">
      <keep-alive>
        <router-view></router-view>
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
export default {
  data: () => ({
    drawer: null
  }),
  created: function() {
    if (!this.user && this.isLoggedIn) {
      this.$store.dispatch("getUserData");
    }

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
    user() {
      return this.$store.getters.user;
    }
  },
  methods: {
    logout: function() {
      this.$store.dispatch("logout").then(() => {
        this.$router.push("/login");
      });
    }
  }
};
</script>

<style lang="scss">
</style>