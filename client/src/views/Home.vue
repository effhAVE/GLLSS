<template>
  <div v-if="user.roles.includes('guest')">
    <p>
      Thank you for signing up. Before you continue, you must be confirmed by an
      admin.
    </p>
    <p>
      Here is the list of current admins:
    </p>
    <ul v-for="admin in admins" :key="admin._id">
      <li>{{ admin.nickname }}</li>
    </ul>
  </div>
  <div v-else>
    <p>Welcome {{ user.nickname }}!</p>
    <p v-if="tournamentsHosted.length">You're hosting:</p>
    <ul v-for="tournament in tournamentsHosted" :key="tournament._id">
      <li>
        <router-link :to="`/tournaments/${tournament._id}`"
          >{{ tournament.name }}
        </router-link>
        - {{ tournament.startDate | moment("LLL") }}
      </li>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  data() {
    return {
      admins: [],
      tournamentsHosted: []
    };
  },
  computed: {
    user() {
      return this.$jwt.decode(this.$store.state.token);
    }
  },
  created() {
    const APIURL = process.env.VUE_APP_APIURL;
    if (this.user.roles.includes("guest")) {
      this.$http.get(`${APIURL}/users/admins`).then(response => {
        this.admins = response.data;
      });
    } else {
      this.$http.get(`${APIURL}/tournaments/hosted`).then(response => {
        this.tournamentsHosted = response.data;
      });
    }
  }
};
</script>
