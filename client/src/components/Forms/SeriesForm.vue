<template>
  <v-form ref="form" style="min-width: 500px" v-model="valid">
    <v-text-field
      v-model="draft.name"
      color="accent"
      label="Name"
      prepend-icon="mdi-pencil"
      required
      :rules="validations.name"
    ></v-text-field>
    <DatetimePicker
      :date="draft.startDate"
      label="Start date"
      @input="draft.startDate = $event"
      :rules="validations.startDate"
    />
    <DatetimePicker
      :date="draft.endDate"
      label="End date"
      @input="draft.endDate = $event"
      icon="mdi-calendar-check"
      :rules="validations.endDate"
    />
    <v-select
      :items="gamesList"
      label="Game"
      prepend-icon="mdi-gamepad"
      color="accent"
      v-model="draft.game"
      :rules="validations.required"
    ></v-select>
    <v-select
      :items="regionsList"
      item-text="name"
      label="Region"
      prepend-icon="mdi-earth"
      color="accent"
      v-model="draft.region"
      :rules="validations.required"
    ></v-select>
    <v-select
      :items="recurrencesList"
      label="Recurrence"
      prepend-icon="mdi-calendar-sync"
      color="accent"
      v-model="draft.recurrence"
      :rules="validations.required"
    ></v-select>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn
        color="accent black--text"
        class="mt-8"
        text
        @click="$emit('submit', draft)"
        :disabled="!valid"
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
        endDate: this.$moment()
          .utc()
          .format("YYYY-MM-DD HH:mm"),
        startDate: this.$moment()
          .utc()
          .format("YYYY-MM-DD HH:mm"),
        game: "",
        region: "",
        recurrence: ""
      },
      validations: {
        name: validations.seriesName,
        startDate: validations.startDate,
        endDate: [
          ...validations.endDate,
          v =>
            this.$moment(this.draft.startDate).isSameOrBefore(v, "minute") ||
            "End date cannot be before start date"
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
      this.draft.endDate = this.$moment
        .utc(this.series.endDate)
        .format("YYYY-MM-DD HH:mm");
      this.draft.startDate = this.$moment
        .utc(this.series.startDate)
        .format("YYYY-MM-DD HH:mm");
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