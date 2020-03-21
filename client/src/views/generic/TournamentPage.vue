<template>
  <pre class="tournament">
    {{ JSON.stringify(tournament, null, 2) }}
  </pre>
</template>

<script>
export default {
  name: "Tournament",
  data() {
    return {
      id: this.$route.params.tournamentID,
      tournament: null
    };
  },
  created() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http
      .get(`${APIURL}/tournaments/${this.id}`)
      .then(response => {
        this.tournament = response.data;
      })
      .catch(error => {
        if (error.response.status === 404) {
          this.$router.push("/notfound");
        }
      });
  }
};
</script>
