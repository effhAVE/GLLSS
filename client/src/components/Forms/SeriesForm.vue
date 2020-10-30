<template>
  <v-form ref="form" style="min-width: 500px" v-model="valid">
    <v-text-field
      v-model="draft.name"
      color="accent"
      label="Name"
      prepend-icon="mdi-pencil"
      required
      :rules="validations.name"
      :disabled="!!series && !$store.getters.hasPermission('seriesProps.name')"
    ></v-text-field>
    <DatetimePicker
      :date="draft.startDate"
      label="Start date"
      @input="draft.startDate = $event"
      :rules="validations.startDate"
      :disabled="!!series && !$store.getters.hasPermission('seriesProps.dates')"
    />
    <DatetimePicker
      :date="draft.endDate"
      label="End date"
      @input="draft.endDate = $event"
      icon="mdi-calendar-check"
      :rules="validations.endDate"
      :disabled="!!series && !$store.getters.hasPermission('seriesProps.dates')"
    />
    <v-select
      :items="gamesList"
      label="Game"
      prepend-icon="mdi-gamepad"
      color="accent"
      v-model="draft.game"
      :rules="validations.required"
      :disabled="!!series && !$store.getters.hasPermission('seriesProps.game')"
    ></v-select>
    <v-select
      :items="regionsList"
      item-text="name"
      label="Region"
      prepend-icon="mdi-earth"
      color="accent"
      v-model="draft.region"
      :disabled="!!series && !$store.getters.hasPermission('seriesProps.region')"
    ></v-select>
    <v-select
      :items="recurrencesList"
      label="Recurrence"
      prepend-icon="mdi-calendar-sync"
      color="accent"
      v-model="draft.recurrence"
      :rules="validations.required"
      :disabled="!!series && !$store.getters.hasPermission('seriesProps.recurrence')"
    ></v-select>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('submit', draft)" :disabled="!valid"> Save </v-btn>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('cancel')" v-if="series"> Cancel </v-btn>
    </v-row>
  </v-form>
</template>

<script>
import DatetimePicker from "./CustomDatetimePicker";
import validations from "../../helpers/validations";
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
        endDate: this.$moment().add(1, "hours").add(1, "years").startOf("hour").toDate(),
        startDate: this.$moment().add(1, "hours").startOf("hour").toDate(),
        game: "",
        region: null,
        recurrence: ""
      },
      validations: {
        name: validations.seriesName,
        startDate: validations.startDate,
        endDate: [
          ...validations.endDate,
          v => this.$moment(this.draft.startDate).isSameOrBefore(v, "minute") || "End date cannot be before start date"
        ],
        required: validations.required
      },
      valid: true,
      regionsList: [],
      gamesList: [],
      recurrencesList: []
    };
  },
  created() {
    if (this.series) {
      this.draft = Object.assign({}, this.series);
      this.draft.endDate = this.$moment(this.draft.endDate).toDate();
      this.draft.startDate = this.$moment(this.draft.startDate).toDate();
    }

    this.$http.get(`${this.APIURL}/collections/games`).then(response => {
      this.gamesList = response.data;
    });

    this.$http.get(`${this.APIURL}/collections/regions`).then(response => {
      this.regionsList = response.data;
    });

    this.$http.get(`${this.APIURL}/collections/recurrences`).then(response => {
      this.recurrencesList = response.data;
    });
  }
};
</script>