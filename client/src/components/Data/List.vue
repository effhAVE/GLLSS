<template>
  <v-data-table
    class="table-background"
    :items="monthsList"
    :headers="headers"
    @click:row="redirect"
    no-data-text="No data"
    item-key="_id"
    hide-default-footer
  >
    <template v-slot:item.date="{ item }">
      <span>{{ item.date | moment("MMMM YYYY") }}</span>
    </template>
    <template v-slot:item.updatedAt="{ item }">
      <span>{{ item.updatedAt | moment("MMMM Do LT") }}</span>
    </template>
  </v-data-table>
</template>
<script>
export default {
  data() {
    return {
      monthsList: [],
      headers: [
        {
          text: "Period",
          align: "start",
          sortable: false,
          value: "date"
        },
        { text: "Last update", value: "updatedAt" }
      ]
    };
  },
  methods: {
    getData() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.get(`${APIURL}/data/`).then(response => {
        this.monthsList = response.data;
      });
    },
    redirect(dataMonth) {
      return this.$router.push(`/data/${dataMonth.date}`);
    }
  },
  mounted() {
    this.getData();
  }
};
</script>