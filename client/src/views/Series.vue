<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Series
    </v-card-title>
    <Table />
  </v-card>
</template>
<script>
import Table from "../components/SeriesList/Table";
export default {
  components: {
    Table
  }
};
</script>