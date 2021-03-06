<template>
  <v-form ref="form" style="min-width: 500px" v-model="valid">
    <v-text-field
      v-model="draft.name"
      color="accent"
      :hint="!!draft.series && !belongsToSeries ? 'The name may be overwritten with the series\' name.' : ''"
      label="Name"
      prepend-icon="mdi-pencil"
      required
      persistent-hint
      :rules="validations.name"
      :disabled="!!tournament && !$store.getters.hasPermission('tournamentsProps.name')"
    ></v-text-field>
    <v-select
      :items="seriesList"
      :disabled="!!tournament || !$store.getters.hasPermission('tournamentsProps.series')"
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
    <v-text-field
      v-model="draft.gllURL"
      color="accent"
      label="Admin page URL"
      prepend-icon="mdi-share"
      :rules="validations.url"
      :disabled="!!tournament && !$store.getters.hasPermission('tournamentsProps.gllURL')"
    ></v-text-field>
    <DatetimePicker
      :date="draft.startDate"
      label="Start date"
      @input="draft.startDate = $event"
      :rules="validations.startDate"
      :disabled="!!tournament && !$store.getters.hasPermission('tournamentsProps.dates')"
    />
    <DatetimePicker
      :date="draft.endDate"
      label="End date"
      @input="draft.endDate = $event"
      icon="mdi-calendar-check"
      :rules="validations.endDate"
      :disabled="!!tournament && !$store.getters.hasPermission('tournamentsProps.dates')"
    />
    <v-select
      :items="gamesList"
      label="Game"
      prepend-icon="mdi-gamepad"
      color="accent"
      :disabled="(!!tournament && !!draft.series) || !$store.getters.hasPermission('tournamentsProps.game')"
      v-model="draft.game"
      :rules="validations.seriesInherited"
    ></v-select>
    <v-select
      :items="regionsList"
      label="Region"
      item-text="name"
      prepend-icon="mdi-earth"
      color="accent"
      :hint="!!draft.series && !belongsToSeries ? 'The region may be overwritten with the series\' region.' : ''"
      persistent-hint
      v-model="draft.region"
      :rules="validations.required"
      :disabled="!!tournament && !$store.getters.hasPermission('tournamentsProps.region')"
    ></v-select>
    <v-checkbox
      v-model="draft.countedByRounds"
      label="Counted by rounds"
      prepend-icon="mdi-currency-usd"
      color="accent"
      :disabled="!!tournament && !$store.getters.hasPermission('tournamentsProps.countedByRounds')"
    ></v-checkbox>
    <v-checkbox v-if="copy" v-model="copyRounds" label="Copy rounds" prepend-icon="mdi-view-grid-plus" color="accent"></v-checkbox>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn color="accent black--text" class="mt-8" text @click="onSubmit" :disabled="!valid"> Save </v-btn>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('cancel')" v-if="tournament"> Cancel </v-btn>
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
    tournament: Object,
    copy: Boolean
  },
  data() {
    return {
      draft: {
        name: "Unnamed tournament",
        gllURL: "",
        endDate: this.$moment().add(8, "hours").startOf("hour").toDate(),
        startDate: this.$moment().add(1, "hours").startOf("hour").toDate(),
        series: null,
        game: "",
        region: "",
        countedByRounds: true
      },
      copyRounds: true,
      validations: {
        name: validations.tournamentName,
        startDate: validations.startDate,
        endDate: [
          ...validations.endDate,
          v => this.$moment(this.draft.startDate).isSameOrBefore(v, "minute") || "End date cannot be before start date"
        ],
        seriesInherited: [
          v => {
            const inherits = !!this.draft.series || !!v;
            return inherits || "This field cannot be empty when not a part of a series";
          }
        ],
        url: validations.tournamentUrl,
        required: validations.required
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
    },

    onSubmit() {
      if (this.copy) {
        if (!this.copyRounds) this.draft.rounds = [];
        this.draft.rounds.forEach(round => {
          round.startDate = this.$moment
            .utc(round.startDate)
            .add(this.$moment.utc(this.draft.startDate).diff(this.$moment.utc(this.tournament.startDate), "minutes"), "minutes")
            .format();

          round.endDate = this.$moment
            .utc(round.endDate)
            .add(this.$moment.utc(this.draft.endDate).diff(this.$moment.utc(this.tournament.endDate), "minutes"), "minutes")
            .format();
        });
      }

      this.$emit("submit", this.draft);
    }
  },
  created() {
    if (this.tournament) {
      this.draft = Object.assign({}, this.tournament);
      if (this.tournament.series) {
        this.belongsToSeries = true;
      }

      if (this.copy) {
        this.draft.gllURL = "";
      }

      this.draft.endDate = this.$moment(this.tournament.endDate).toDate();
      this.draft.startDate = this.$moment(this.tournament.startDate).toDate();
    }

    this.$http.get(`${this.APIURL}/collections/games`).then(response => {
      this.gamesList = response.data;
    });

    this.$http.get(`${this.APIURL}/collections/regions`).then(response => {
      this.regionsList = response.data;
    });

    this.$http.get(`${this.APIURL}/series/list`).then(response => {
      this.seriesList = response.data;
    });
  }
};
</script>