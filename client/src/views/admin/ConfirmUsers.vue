<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Unconfirmed users
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
      disable-pagination
      hide-default-footer
    >
      <template v-slot:item.createdAt="{ item }">
        <span>{{ item.createdAt | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
    </v-data-table>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        class="accent black--text"
        @click="confirm"
        :disabled="!selected.length"
        >Confirm selected</v-btn
      >
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
      headers: [
        {
          text: "Nickname",
          value: "nickname"
        },
        { text: "ID", value: "_id" },
        { text: "Verified", value: "isVerified" },
        { text: "Registration date", value: "createdAt" }
      ]
    };
  },
  methods: {
    confirm() {
      const promises = [];
      this.selected.forEach(user => {
        const APIURL = process.env.VUE_APP_APIURL;
        promises.push(
          this.$http
            .post(`${APIURL}/users/${user._id}/confirm`)
            .catch(error => error)
        );
      });

      Promise.all(promises)
        .then(() => {
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Users confirmed."
          });
          this.$router.go();
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: "Error while confirming users."
          });
        });
    }
  },
  mounted() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http
      .get(`${APIURL}/users/unconfirmed`)
      .then(response => {
        this.users = response.data;
      })
      .catch(error => {});
  }
};
</script>