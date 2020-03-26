<template>
  <v-form ref="form" style="min-width: 500px">
    <v-text-field
      v-model="draft.name"
      color="accent"
      label="Name"
      prepend-icon="mdi-pencil"
      required
    ></v-text-field>
    <v-menu
      v-model="datepickerStart"
      :close-on-content-click="true"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="draft.startDate"
          label="Start date"
          color="accent"
          prepend-icon="mdi-calendar"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="draft.startDate"
        color="secondary"
        @input="datepickerStart = false"
      ></v-date-picker>
    </v-menu>
    <v-menu
      v-model="datepickerEnd"
      :close-on-content-click="true"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="draft.endDate"
          label="End date"
          color="accent"
          prepend-icon="mdi-calendar-check"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="draft.endDate"
        color="secondary"
        @input="datepickerStart = false"
      ></v-date-picker>
    </v-menu>
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
export default {
  props: {
    tournamentDates: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      datepickerStart: false,
      datepickerEnd: false,
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
    this.draft.startDate = this.tournamentDates.start.substr(0, 10);
    this.draft.endDate = this.tournamentDates.end.substr(0, 10);
  }
};
</script>