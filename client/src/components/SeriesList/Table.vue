<template>
  <v-data-table
    class="table-background"
    :items="seriesList"
    :headers="headers"
    @click:row="redirect"
    no-data-text="No series"
    item-key="_id"
    hide-default-footer
  >
  </v-data-table>
</template>
<script>
export default {
  data() {
    return {
      seriesList: [],
      headers: [
        {
          text: "Series name",
          align: "start",
          sortable: false,
          value: "name"
        },
        {
          text: "Tournaments count",
          value: "tournaments.length",
          align: "center",
          sortable: false,
          width: 200
        },
        { text: "Game", value: "game", width: 300 },
        { text: "Region", value: "region", width: 300 }
      ]
    };
  },
  methods: {
    getSeries() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.get(`${APIURL}/series/`).then(response => {
        this.seriesList = response.data;
      });
    },
    redirect(series) {
      return this.$router.push(`/series/${series._id}`);
    }
  },
  mounted() {
    this.getSeries();
  },
  watch: {
    $route: "getSeries"
  }
};
</script>