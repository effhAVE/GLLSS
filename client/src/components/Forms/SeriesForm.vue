<template>
  <v-form ref="form" style="min-width: 500px">
    <v-text-field
      v-model="draft.name"
      color="accent"
      label="Name"
      prepend-icon="mdi-pencil"
      required
    ></v-text-field>
    <DatetimePicker
      :date="draft.startDate"
      label="Start date"
      @input="draft.startDate = $event"
    />
    <DatetimePicker
      :date="draft.endDate"
      label="End date"
      @input="draft.endDate = $event"
      icon="mdi-calendar-check"
    />
    <v-select
      :items="gamesList"
      label="Game"
      prepend-icon="mdi-gamepad"
      color="accent"
      v-model="draft.game"
    ></v-select>
    <v-select
      :items="regionsList"
      label="Region"
      prepend-icon="mdi-earth"
      color="accent"
      v-model="draft.region"
    ></v-select>
    <v-select
      :items="recurrencesList"
      label="Recurrence"
      prepend-icon="mdi-calendar-sync"
      color="accent"
      v-model="draft.recurrence"
    ></v-select>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn
        color="accent black--text"
        class="mt-8"
        text
        @click="$emit('submit', draft)"
      >
        Save
      </v-btn>
      <v-btn
        color="accent black--text"
        class="mt-8"
        text
        @click="$emit('cancel')"
        v-if="series"
      >
        Cancel
      </v-btn>
    </v-row>
  </v-form>
</template>

<script>
import DatetimePicker from "./CustomDatetimePicker";

export default {
  components: {
    DatetimePicker
  },
  props: {
    series: Object
  },
  data() {
    return {
      draft: {
        name: "Unnamed series",
        startDate: new Date(),
        endDate: new Date(),
        game: "",
        region: "",
        recurrence: ""
      },
      regionsList: [],
      gamesList: [],
      recurrencesList: []
    };
  },
  created() {
    if (this.series) {
      this.draft = this.series;
      this.draft.startDate = new Date(this.series.startDate);
      this.draft.endDate = new Date(this.series.endDate);
    }

    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/collections/games`).then(response => {
      this.gamesList = response.data;
    });

    this.$http.get(`${APIURL}/collections/regions`).then(response => {
      this.regionsList = response.data;
    });

    this.$http.get(`${APIURL}/collections/recurrences`).then(response => {
      this.recurrencesList = response.data;
    });
  }
};
</script>