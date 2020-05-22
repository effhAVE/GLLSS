<template>
  <v-form ref="form" style="min-width: 500px" v-model="valid">
    <v-text-field v-model="draft.name" color="accent" label="Name" prepend-icon="mdi-pencil" :rules="validations.name" required></v-text-field>
    <DatetimePicker :date="draft.startDate" label="Start date" @input="draft.startDate = $event" :rules="validations.startDate" />
    <DatetimePicker :date="draft.endDate" label="End date" @input="draft.endDate = $event" icon="mdi-calendar-check" :rules="validations.endDate" />
    <v-text-field v-model="draft.bestOf" type="number" color="accent" label="Best of" prepend-icon="mdi-pencil" required :rules="validations.bestOf">
    </v-text-field>
    <v-text-field
      v-model="draft.prepTime"
      type="number"
      color="accent"
      label="Preparation time"
      prepend-icon="mdi-pencil"
      required
      :rules="validations.prepTime"
    ></v-text-field>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('submit', draft)" :disabled="!valid">
        Save
      </v-btn>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('cancel')">
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
    tournamentDates: {
      type: Object
    },
    prevRound: {
      type: Object
    },
    round: {
      type: Object
    }
  },
  data() {
    return {
      draft: {
        name: "New round",
        startDate: this.$moment().toDate(),
        endDate: this.$moment().toDate(),
        bestOf: 3,
        prepTime: 0
      },
      validations: {
        name: validations.roundName,
        startDate: validations.startDate,
        endDate: [...validations.endDate, v => this.$moment(this.draft.startDate).isSameOrBefore(v) || "End date cannot be before start date"],
        bestOf: validations.bestOf,
        prepTime: validations.prepTime
      },
      valid: true
    };
  },
  created() {
    if (this.round) {
      this.draft = Object.assign({}, this.round);
      this.draft.startDate = this.$moment(this.round.startDate).toDate();
      this.draft.endDate = this.$moment(this.round.endDate).toDate();
    } else {
      this.draft.startDate = this.$moment(this.tournamentDates.start).toDate();
      this.draft.endDate = this.$moment(this.tournamentDates.end).toDate();

      if (this.prevRound) {
        this.draft.startDate = this.$moment(this.prevRound.startDate).toDate();
        this.draft.endDate = this.$moment(this.prevRound.endDate).toDate();
        this.draft.bestOf = this.prevRound.bestOf;
        this.draft.prepTime = this.prevRound.prepTime;
      }
    }
  }
};
</script>