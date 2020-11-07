<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Users
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details color="accent"></v-text-field>
    </v-card-title>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="users"
      :search="search"
      item-key="_id"
      show-select
      :sort-by="['isVerified', 'roles', 'nickname']"
      :sort-desc="[true, true, false]"
      multi-sort
      class="table-background"
      hide-default-footer
      disable-pagination
    >
      <template v-slot:item.data-table-select="{ item, select, isSelected }">
        <v-simple-checkbox
          :ripple="false"
          @input="select"
          :value="isSelected"
          :disabled="item.nickname === $store.state.user.nickname || item.roles.some(role => role.permissions.includes(`users.permanent`))"
        ></v-simple-checkbox>
      </template>
      <template v-slot:item.createdAt="{ item }">
        <span>{{ item.createdAt | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
      <template v-slot:item.roles="{ item }">
        <v-select
          :items="selectableRoles"
          item-text="role.name"
          item-value="role._id"
          item-color="accent"
          :value="item.roles.map(role => role._id)"
          :disabled="!$store.getters.hasPermission('users.modifyRoles')"
          @input="saveRole(item._id, $event)"
          background-color="transparent"
          color="accent"
          solo
          flat
          hide-details
          multiple
        >
        </v-select>
      </template>
    </v-data-table>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn class="error" @click="deleteUsers" :disabled="!selected.length || !$store.getters.hasPermission('users.delete')">Delete users</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      selected: [],
      users: [],
      roles: [],
      disabledRoles: [],
      headers: [
        {
          text: "Nickname",
          value: "nickname"
        },
        { text: "ID", value: "_id" },
        { text: "Registration date", value: "createdAt" },
        { text: "Verified", value: "isVerified" },
        { text: "Role", value: "roles", width: 250, align: "center", sort: (a, b) => a[0].importance - b[0].importance }
      ]
    };
  },
  computed: {
    selectableRoles() {
      return this.roles.map(role => {
        return {
          role,
          disabled: this.disabledRoles.includes(role)
        };
      });
    }
  },
  methods: {
    saveRole(userID, value) {
      this.$http
        .put(`${this.APIURL}/users/${userID}/roles`, value)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Role saved!",
            type: "success"
          });
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: "Error while saving role.",
            type: "error"
          })
        );
    },
    deleteUsers() {
      this.$http
        .delete(`${this.APIURL}/users/`, { data: this.selected })
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Users successfully deleted.",
            type: "success"
          });

          this.$router.go();
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: "Error while deleting users.",
            type: "error"
          })
        );
    }
  },
  mounted() {
    this.$http.get(`${this.APIURL}/roles`).then(response => {
      this.roles = response.data;
      this.disabledRoles = this.roles.filter(role => this.$store.state.user.roles[0].importance < role.importance);
    });
    this.$http
      .get(`${this.APIURL}/users/`)
      .then(response => {
        this.users = response.data;
      })
      .catch(error => {});
  }
};
</script>