<template>
  <div>
    <v-row class="ma-0 mt-12">
      <h3 class="subtitle">
        Past tournaments
      </h3>
      <v-spacer></v-spacer>
      <v-select
        :items="filters"
        v-model="selectedType"
        @change="changeFilters"
        label="Type"
        outlined
        dense
        color="accent"
        class="filter-input"
      ></v-select>
      <v-select
        :items="gameFilters"
        @change="changeFilters"
        v-model="selectedGameFilters"
        label="Games"
        outlined
        multiple
        dense
        color="accent"
        item-color="accent"
        class="ml-4 filter-input"
        clearable
        :menu-props="{ bottom: true, offsetY: true }"
      ></v-select>
      <v-select
        :items="regionFilters"
        @change="changeFilters"
        item-text="name"
        item-value="name"
        v-model="selectedRegionFilters"
        multiple
        label="Regions"
        class="ml-4 filter-input"
        outlined
        dense
        color="accent"
        item-color="accent"
        clearable
        :menu-props="{ bottom: true, offsetY: true }"
        ><template v-slot:selection="{ item, index }">
          <span v-if="index < 2">{{ item.name }}, </span>
          <span v-if="index === 2" class="grey--text caption ml-1">(+{{ selectedRegionFilters.length - 2 }} others)</span>
        </template></v-select
      >
    </v-row>

    <v-data-table
      class="table-background not-editable"
      :items="pastHosted"
      :headers="headers"
      @click:row="redirect"
      no-data-text="You haven't hosted any tournament"
      item-key="_id"
      hide-default-footer
      disable-pagination
      disable-sort
    >
      <template v-slot:item.name="{ item }">
        <router-link :to="`tournaments/${item._id}`" class="white--text">{{ item.name }}</router-link>
      </template>
      <template v-slot:item.endDate="{ item }">
        <span>{{ item.endDate | moment("MMMM DD, YYYY HH:mm") }}</span>
      </template>
      <template v-slot:footer>
        <div class="v-data-footer">
          <v-spacer></v-spacer>
          <v-btn class="accent--text" text tile @click="getNextTournamentsPage" :disabled="allLoaded">
            Load more
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    gameFilters: Array,
    regionFilters: Array,
    redirect: Function
  },
  data() {
    return {
      pastHosted: [],
      allLoaded: false,
      limit: 10,
      page: 0,
      headers: [
        {
          text: "Tournament name",
          align: "start",
          value: "name"
        },
        { text: "Game", value: "game", align: "center", width: 200 },
        { text: "Region", value: "region", width: 200 },
        { text: "End date", value: "endDate" }
      ],
      filters: [
        {
          text: "All",
          value: ""
        },
        {
          text: "Lost hosting/leading",
          value: "lost"
        },
        {
          text: "Hosted",
          value: "hosted"
        }
      ],
      selectedType: "",
      selectedGameFilters: [],
      selectedRegionFilters: []
    };
  },
  methods: {
    getPastTournaments() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(
          `${APIURL}/tournaments/hosted/past?limit=${this.limit}&page=${this.page}&type=${this.selectedType}&games=${this.selectedGameFilters}&regions=${this.selectedRegionFilters}`
        )
        .then(response => {
          if (response.data.length < this.limit) this.allLoaded = true;
          this.pastHosted.push(...response.data);
        });
    },
    changeFilters() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.allLoaded = false;
      this.page = 0;
      this.$http
        .get(
          `${APIURL}/tournaments/hosted/past?limit=${this.limit}&page=${this.page}&type=${this.selectedType}&games=${this.selectedGameFilters}&regions=${this.selectedRegionFilters}`
        )
        .then(response => {
          if (response.data.length < this.limit) this.allLoaded = true;
          this.pastHosted = response.data;
        });
    },
    getNextTournamentsPage() {
      this.page++;
      this.getPastTournaments();
    }
  }
};
</script>