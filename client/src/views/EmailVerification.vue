<template>
  <InfoGrid>
    <template v-slot:pageTitle>
      Email verification
    </template>
    <slot>{{ message }}</slot>
    <template v-slot:action>
      <router-link to="/login">Go to login page</router-link>
    </template>
  </InfoGrid>
</template>

<script>
import InfoGrid from "../components/InfoGrid";
export default {
  components: {
    InfoGrid
  },
  data() {
    return {
      token: this.$route.query.token,
      message: "Sending a request..."
    };
  },
  methods: {
    verifyEmail() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/users/verify-email?token=${this.token}`)
        .then(response => {
          if (response.status >= 400) {
            throw Error(response.data);
          }
          this.$store.commit("snackbarMessage", {
            message: response.data || response,
            type: "success"
          });

          this.$router.push("/login");
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error,
            type: "error"
          });
        });
    }
  },
  created() {
    if (!this.token) {
      this.$router.push("/");
    } else {
      this.verifyEmail();
    }
  }
};
</script>