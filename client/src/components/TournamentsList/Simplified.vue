<template>
  <div>
    <v-row class="mt-4">
      <v-card-subtitle>Tournaments</v-card-subtitle>
    </v-row>
    <v-data-table
      class="table-background"
      :items="tournaments"
      :headers="headers"
      @click:row="redirect"
      no-data-text="No tournaments"
      item-key="_id"
      hide-default-footer
      disable-pagination
    >
      <template v-slot:item.name="{ item }">
        <router-link :to="`/tournaments/${item._id}`" class="white--text">{{ item.name }}</router-link>
      </template>
      <template v-slot:item.startDate="{ item }">
        <span>{{ item.startDate | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
      <template v-slot:item.endDate="{ item }">
        <span>{{ item.endDate | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
      <template v-slot:footer>
        <div class="v-data-footer">
          <v-spacer></v-spacer>
          <v-btn class="accent--text" text tile @click="$emit('getNextPage')" :disabled="allLoaded"> Load more </v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    tournaments: {
      type: Array,
      default: () => []
    },
    allLoaded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      search: "",
      headers: [
        {
          text: "Tournament name",
          align: "start",
          sortable: false,
          value: "name"
        },
        { text: "Start date", value: "startDate" },
        { text: "End date", value: "endDate" }
      ]
    };
  },
  methods: {
    redirect(tournament) {
      return this.$router.push(`/tournaments/${tournament._id}`).catch(err => {});
    }
  }
};
</script>