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
      v-model="draft.TLValue"
      type="number"
      color="accent"
      label="TL Value"
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
        Create!
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
      type: Object,
      required: true
    }
  },
  data() {
    return {
      draft: {
        name: "New round",
        startDate: new Date().toISOString().substr(0, 10),
        endDate: new Date().toISOString().substr(0, 10),
        bestOf: 3,
        TLValue: 3
      }
    };
  },
  created() {
    this.draft.startDate = `${new Date(this.tournamentDates.start)
      .toISOString()
      .substr(0, 10)} ${new Date(this.tournamentDates.start)
      .toISOString()
      .substr(11, 5)}`;
    this.draft.endDate = `${new Date(this.tournamentDates.end)
      .toISOString()
      .substr(0, 10)} ${new Date(this.tournamentDates.end)
      .toISOString()
      .substr(11, 5)}`;
  }
};
</script>