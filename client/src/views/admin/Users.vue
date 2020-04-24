<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Users
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
        color="accent"
      ></v-text-field>
    </v-card-title>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="users"
      :search="search"
      item-key="_id"
      show-select
      class="table-background"
      hide-default-footer
      disable-pagination
    >
      <template v-slot:item.data-table-select="{ item, select, isSelected }">
        <v-simple-checkbox
          :ripple="false"
          @input="select"
          :value="isSelected"
          :disabled="
            item.nickname === user.nickname ||
              item.roles.includes(`masteradmin`)
          "
        ></v-simple-checkbox>
      </template>
      <template v-slot:item.createdAt="{ item }">
        <span>{{ item.createdAt | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
      <template v-slot:item.roles="{ item }">
        <v-select
          :items="selectableRoles"
          :disabled="isDisabled(item) || user._id === item._id"
          :value="item.roles[0]"
          @input="saveRole(item._id, $event)"
          background-color="transparent"
          color="accent"
          solo
          flat
          hide-details
        >
        </v-select>
      </template>
    </v-data-table>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        class="error"
        @click="deleteUsers"
        :disabled="!selected.length || !user.roles.includes('masteradmin')"
        >Delete users</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    user: Object
  },
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
        { text: "Role", value: "roles", width: 250, align: "center" }
      ]
    };
  },
  computed: {
    selectableRoles() {
      return this.roles.map(role => {
        return {
          text: role,
          disabled: this.disabledRoles.includes(role)
        };
      });
    }
  },
  methods: {
    isSelectable(role) {
      if (this.user.roles.includes("masteradmin")) return false;
      return !this.user.roles.includes(role) || this.user.roles[0] === role;
    },
    isDisabled(item) {
      return this.isSelectable(item.roles[0]);
    },
    saveRole(userID, value) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .put(`${APIURL}/users/${userID}/roles`, { role: value })
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
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .delete(`${APIURL}/users/`, { data: this.selected })
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
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/collections/roles`).then(response => {
      this.roles = response.data;
      this.disabledRoles = this.roles
        .filter(role => this.isSelectable(role))
        .filter(role => role !== "guest");
    });
    this.$http
      .get(`${APIURL}/users/`)
      .then(response => {
        this.users = response.data;
      })
      .catch(error => {});
  }
};
</script>