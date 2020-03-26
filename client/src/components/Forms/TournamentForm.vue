<template>
  <v-form ref="form" style="min-width: 500px">
    <v-text-field
      v-model="draft.name"
      color="accent"
      label="Name"
      prepend-icon="mdi-pencil"
      required
    ></v-text-field>
    <v-select
      :items="seriesList"
      v-model="draft.series"
      label="Series"
      prepend-icon="mdi-view-list"
      color="accent"
    >
      <template v-slot:item="{ item }">
        {{ item.name }}
      </template>
      <template v-slot:selection="{ item }">
        {{ item.name }}
      </template>
    </v-select>
    <DatetimePicker
      :date="draft.startDate"
      label="Start date"
      @input="draft.startDate = $event"
    />
    <DatetimePicker
      :date="draft.endDate"
      label="End date"
      @input="draft.endDate = $event"
    />
    <v-select
      :items="gamesList"
      label="Game"
      prepend-icon="mdi-gamepad"
      color="accent"
      :disabled="!!draft.series"
      v-model="draft.game"
    ></v-select>
    <v-select
      :items="regionsList"
      label="Region"
      prepend-icon="mdi-earth"
      color="accent"
      :disabled="!!draft.series"
      v-model="draft.region"
    ></v-select>
    <v-checkbox
      v-model="draft.countedByRounds"
      label="Counted by rounds"
      prepend-icon="mdi-currency-usd"
      color="accent"
    ></v-checkbox>
    <v-btn
      color="accent black--text"
      class="mt-8"
      large
      @click="$emit('submit', draft)"
    >
      Create!
    </v-btn>
  </v-form>
</template>

<script>
import DatetimePicker from "./CustomDatetimePicker";

export default {
  components: {
    DatetimePicker
  },
  data() {
    return {
      draft: {
        name: "Unnamed tournament",
        startDate: `${new Date()
          .toISOString()
          .substr(0, 10)} ${new Date().toISOString().substr(11, 5)}`,
        endDate: `${new Date()
          .toISOString()
          .substr(0, 10)} ${new Date().toISOString().substr(11, 5)}`,
        series: null,
        game: "",
        region: "",
        countedByRounds: true
      },
      regionsList: [],
      gamesList: [],
      seriesList: []
    };
  },
  created() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/collections/games`).then(response => {
      this.gamesList = response.data;
    });

    this.$http.get(`${APIURL}/collections/regions`).then(response => {
      this.regionsList = response.data;
    });

    this.$http.get(`${APIURL}/series/list`).then(response => {
      this.seriesList = response.data;
    });
  }
};
</script>