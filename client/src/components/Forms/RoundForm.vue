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
    <v-text-field
      v-model="draft.bestOf"
      type="number"
      color="accent"
      label="Best of"
      prepend-icon="mdi-pencil"
      required
    >
    </v-text-field>
    <v-text-field
      v-model="draft.prepTime"
      type="number"
      color="accent"
      label="Preparation time"
      prepend-icon="mdi-pencil"
      required
    ></v-text-field>
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
    tournamentDates: {
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
        startDate: new Date(),
        endDate: new Date(),
        bestOf: 3,
        prepTime: 3
      }
    };
  },
  created() {
    if (this.round) {
      this.draft = this.round;
      this.draft.startDate = new Date(this.round.startDate);
      this.draft.endDate = new Date(this.round.endDate);
    } else {
      this.draft.startDate = new Date(this.tournamentDates.start);
      this.draft.endDate = new Date(this.tournamentDates.end);
    }
  }
};
</script>