<template>
  <v-list dense>
    <v-list-item link to="/">
      <v-list-item-action>
        <v-icon>mdi-view-dashboard</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Overview</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/tournaments" v-if="user.roles.includes(`host`)">
      <v-list-item-action>
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Tournaments</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/series" v-if="user.roles.includes(`host`)">
      <v-list-item-action>
        <v-icon>mdi-view-list</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Series</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/calendar" v-if="user.roles.includes(`host`)">
      <v-list-item-action>
        <v-icon>mdi-calendar</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Calendar</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/schedule" v-if="user.roles.includes(`teamleader`)">
      <v-list-item-action>
        <v-icon>mdi-clock-outline</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Schedule</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/accounts" v-if="user.roles.includes(`host`)">
      <v-list-item-action>
        <v-icon>mdi-account-group</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Accounts</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/data" v-if="user.roles.includes(`host`)">
      <v-list-item-action>
        <v-icon>mdi-database</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Data</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item link to="/teamkills" v-if="user.roles.includes(`host`)">
      <v-list-item-action>
        <v-icon>mdi-target-account</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Teamkills script</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item
      link
      href="https://docs.google.com/document/d/1Pr5SR5eYc-W2-28ZWG_nft1PO4NjvgQe6EtKEeJ9vUU/edit?fbclid=IwAR3vUT4mmnuNmlGoAfEFzHRE35eRXqmFfDooGxKi1_phIZR5BuOHl0A58TU"
      target="_blank"
      v-if="user.roles.includes(`host`)"
    >
      <v-list-item-action>
        <v-icon>mdi-book-open-page-variant</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Hosting guide</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-group prepend-icon="mdi-shield-account" color="accent" v-if="user.roles.includes(`admin`)" :value="$route.path.includes('admin')">
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
      <v-list-item link to="/admin/series/create">
        <v-list-item-content>
          <v-list-item-title>Create a series</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/data/create">
        <v-list-item-content>
          <v-list-item-title>Create a data month</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link to="/admin/accounts/create">
        <v-list-item-content>
          <v-list-item-title>Create an account</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>
  </v-list>
</template>

<script>
export default {
  props: {
    user: Object
  }
};
</script>