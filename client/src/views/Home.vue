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
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  data() {
    return {
      admins: []
    };
  },
  computed: {
    user() {
      return this.$jwt.decode(this.$store.state.token);
    }
  },
  created() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/users/admins`).then(response => {
      this.admins = response.data;
    });
  }
};
</script>
