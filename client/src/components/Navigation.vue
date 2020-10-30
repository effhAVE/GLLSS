<template>
  <v-list dense>
    <v-list-item link to="/">
      <v-list-item-action>
        <v-icon>mdi-view-dashboard</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Home</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/tournaments" v-if="$store.getters.hasPermission('tournaments.view')">
      <v-list-item-action>
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Tournaments</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/series" v-if="$store.getters.hasPermission('series.view')">
      <v-list-item-action>
        <v-icon>mdi-view-list</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Series</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/calendar" v-if="$store.getters.hasPermission('general.isHost')">
      <v-list-item-action>
        <v-icon>mdi-calendar</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Calendar</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/schedule" v-if="$store.getters.hasPermission('general.isTL')">
      <v-list-item-action>
        <v-icon>mdi-clock-outline</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Schedule</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/accounts" v-if="$store.getters.hasPermission('accounts.view')">
      <v-list-item-action>
        <v-icon>mdi-account-group</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Accounts</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/codes" v-if="$store.getters.hasPermission('codes.view')">
      <v-list-item-action>
        <v-icon>mdi-account-key</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Codes</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/data" v-if="$store.getters.hasPermission('data.view')">
      <v-list-item-action>
        <v-icon>mdi-database</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Data</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-group prepend-icon="mdi-help-circle" color="accent" v-if="$store.getters.hasAnyPermission(['general.isHost', 'general.isTL'])">
      <template v-slot:activator>
        <v-list-item-title>Helpers</v-list-item-title>
      </template>
      <v-list-item link to="/teamkills">
        <v-list-item-content>
          <v-list-item-title>Teamkills script</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/apex">
        <v-list-item-content>
          <v-list-item-title>Apex autoscoring</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>

    <v-list-group prepend-icon="mdi-book-open-page-variant" color="accent" v-if="$store.getters.hasPermission('articles.view')">
      <template v-slot:activator>
        <v-list-item-title>Guides</v-list-item-title>
      </template>
      <v-list-item link to="/articles/5ee66cfc24db59244807ff70">
        <v-list-item-content>
          <v-list-item-title>GLLSS Guide</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/articles/5ee66cef24db59244807ff6f">
        <v-list-item-content>
          <v-list-item-title>Hosting Guide</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>
    <v-list-item link to="/articles" v-if="$store.getters.hasPermission('articles.view')">
      <v-list-item-action>
        <v-icon>mdi-newspaper-variant-outline</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Articles</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-group prepend-icon="mdi-shield-account" color="accent" :value="$route.path.includes('admin')" v-if="showAdminSubdir">
      <template v-slot:activator>
        <v-list-item-title>Admin</v-list-item-title>
      </template>
      <v-list-item link to="/admin/users" v-if="$store.getters.hasPermission('users.update')">
        <v-list-item-content>
          <v-list-item-title>Users</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/roles" v-if="$store.getters.hasPermission('roles.view')">
        <v-list-item-content>
          <v-list-item-title>Roles</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/unconfirmed" v-if="$store.getters.hasPermission('users.confirm')">
        <v-list-item-content>
          <v-list-item-title>Confirm users</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/tournaments" v-if="$store.getters.hasPermission('tournaments.create')">
        <v-list-item-content>
          <v-list-item-title>Create a tournament</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/series" v-if="$store.getters.hasPermission('series.create')">
        <v-list-item-content>
          <v-list-item-title>Create a series</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/data" v-if="$store.getters.hasPermission('data.create')">
        <v-list-item-content>
          <v-list-item-title>Create a data month</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/accounts" v-if="$store.getters.hasPermission('accounts.create')">
        <v-list-item-content>
          <v-list-item-title>Create an account</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/codes" v-if="$store.getters.hasPermission('codes.create')">
        <v-list-item-content>
          <v-list-item-title>Create a code</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>
    <v-list-item link v-if="$store.state.user" @click="$store.dispatch('logout')">
      <v-list-item-action>
        <v-icon>mdi-lock-open</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Logout</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script>
export default {
  computed: {
    showAdminSubdir() {
      return this.$store.getters.hasAnyPermission([
        "users.update",
        "roles.view",
        "users.confirm",
        "tournaments.create",
        "series.create",
        "data.create",
        "accounts.create",
        "codes.create"
      ]);
    }
  }
};
</script>