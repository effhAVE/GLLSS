<template>
  <v-form ref="form" style="min-width: 500px" v-model="valid">
    <v-text-field
      v-model="draft.name"
      color="accent"
      :disabled="!!draft.series && !belongsToSeries"
      label="Name"
      prepend-icon="mdi-pencil"
      required
      :rules="validations.name"
    ></v-text-field>
    <v-select
      :items="seriesList"
      :disabled="belongsToSeries"
      v-model="draft.series"
      label="Series"
      prepend-icon="mdi-view-list"
      color="accent"
      @input="validate"
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
      :disabled="!!draft.series"
      v-model="draft.game"
      :rules="validations.seriesInherited"
    ></v-select>
    <v-select
      :items="regionsList"
      label="Region"
      item-text="name"
      prepend-icon="mdi-earth"
      color="accent"
      :disabled="!!draft.series"
      v-model="draft.region"
      :rules="validations.seriesInherited"
    ></v-select>
    <v-checkbox
      v-model="draft.countedByRounds"
      label="Counted by rounds"
      prepend-icon="mdi-currency-usd"
      color="accent"
    ></v-checkbox>
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
        v-if="tournament"
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
    tournament: Object
  },
  data() {
    return {
      draft: {
        name: "Unnamed tournament",
        endDate: this.$moment()
          .utc()
          .add(8, "hours")
          .startOf("hour")
          .format("YYYY-MM-DD HH:mm"),
        startDate: this.$moment()
          .utc()
          .add(1, "hours")
          .startOf("hour")
          .format("YYYY-MM-DD HH:mm"),
        series: null,
        game: "",
        region: "",
        countedByRounds: true
      },
      validations: {
        name: validations.tournamentName,
        startDate: validations.startDate,
        endDate: [
          ...validations.endDate,
          v =>
            this.$moment(this.draft.startDate).isSameOrBefore(v, "minute") ||
            "End date cannot be before start date"
        ],
        seriesInherited: [
          v => {
            const inherits = !!this.draft.series || !!v;
            return (
              inherits ||
              "This field cannot be empty when not a part of a series"
            );
          }
        ]
      },
      valid: true,
      belongsToSeries: false,
      regionsList: [],
      gamesList: [],
      seriesList: []
    };
  },
  methods: {
    validate() {
      this.$refs.form.validate();
    }
  },
  created() {
    if (this.tournament) {
      this.draft = Object.assign({}, this.tournament);
      if (this.tournament.series) {
        this.belongsToSeries = true;
      }

      this.draft.endDate = this.$moment
        .utc(this.tournament.endDate)
        .format("YYYY-MM-DD HH:mm");
      this.draft.startDate = this.$moment
        .utc(this.tournament.startDate)
        .format("YYYY-MM-DD HH:mm");
    }

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