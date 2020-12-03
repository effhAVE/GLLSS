<template>
  <v-card height="100%" color="transparent" v-if="user">
    <v-row>
      <v-col class="flex-grow-0">
        <v-row><Avatar :user="user" /></v-row>
        <v-row>
          <v-spacer></v-spacer>
          <v-btn text small color="accent" to="/me/edit" v-if="userID === $store.state.user._id">Edit profile</v-btn>
        </v-row>
      </v-col>
      <v-col><InfoTable :user="user" /></v-col>
    </v-row>
  </v-card>
</template>

<script>
import InfoTable from "../../components/User/UserInfoTable";
import Avatar from "../../components/User/UserAvatar";
export default {
  components: {
    InfoTable,
    Avatar
  },
  props: ["userID"],
  data() {
    return {
      id: this.userID,
      user: null
    };
  },
  methods: {
    getUser(id) {
      if (id === null) id = this.$store.user._id;
      this.$http
        .get(`${this.APIURL}/users/${id}`)
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.user = response.data;
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error
          });
        });
    }
  },
  created() {
    this.getUser(this.id);
  },
  watch: {
    userID: {
      handler(newValue) {
        if (newValue) {
          if (newValue === this.id) return;
          this.id = newValue;
          this.getUser(newValue);
        } else {
          this.id = null;
        }
      },
      immediate: true
    }
  }
};
</script>
