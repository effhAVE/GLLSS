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
    >
      <template v-slot:item.createdAt="{ item }">
        <span>{{ new Date(item.createdAt).toLocaleString() }}</span>
      </template>
      <template v-slot:item.roles="{ item }">
        <v-select
          :items="roles"
          :value="getHighestRole(item.roles)"
          @input="saveRole(item._id, $event)"
          background-color="transparent"
          color="accent"
          solo
          flat
          hide-details
        ></v-select>
      </template>
    </v-data-table>
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
      headers: [
        {
          text: "Nickname",
          value: "nickname"
        },
        { text: "ID", value: "_id" },
        { text: "Registration date", value: "createdAt" },
        { text: "Role", value: "roles", width: 250, align: "center" }
      ]
    };
  },
  methods: {
    getHighestRole(roles) {
      for (const role of this.roles) {
        if (roles.includes(role)) {
          return role;
        }
      }
    },
    saveRole(userID, value) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .put(`${APIURL}/users/${userID}/roles`, { role: value })
        .then(response => {
          this.$emit("snackbarMessage", {
            message: "Role saved!",
            type: "success"
          });
        })
        .catch(error =>
          this.$emit("snackbarMessage", {
            message: "Error while saving role.",
            type: "error"
          })
        );
    }
  },
  mounted() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/collections/roles`).then(response => {
      this.roles = response.data;
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