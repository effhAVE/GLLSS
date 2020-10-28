<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Calendar
      <v-spacer></v-spacer>
      <v-menu
        ref="menu"
        v-model="weekMenu"
        :close-on-content-click="false"
        :return-value.sync="selectedWeek"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            :value="$moment.utc(selectedWeek).isoWeek()"
            label="Selected week"
            prepend-icon="mdi-calendar"
            color="accent"
            readonly
            v-on="on"
            class="flex-grow-0"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="selectedWeek"
          color="accent"
          header-color="secondary"
          first-day-of-week="1"
          :allowed-dates="allowedDates"
          :title-date-format="getPickerTitle"
          :show-current="false"
        >
          <v-spacer></v-spacer>
          <v-btn text color="accent" @click="weekMenu = false">Cancel</v-btn>
          <v-btn text color="accent" @click="$refs.menu.save(selectedWeek)">OK</v-btn>
        </v-date-picker>
      </v-menu>
    </v-card-title>
    <CalendarTable :week="relativeWeek" />
  </v-card>
</template>
<script>
import CalendarTable from "../components/Calendar/Overview";
export default {
  components: {
    CalendarTable
  },
  data() {
    return {
      selectedWeek: this.$moment.utc().startOf("isoWeek").format("YYYY-MM-DD"),
      weekMenu: false
    };
  },
  computed: {
    relativeWeek() {
      return this.$moment.utc(this.selectedWeek).startOf("isoWeek").diff(this.$moment.utc().startOf("isoWeek"), "weeks");
    }
  },
  methods: {
    allowedDates(val) {
      return this.$moment(val).day() === 1;
    },
    getPickerTitle(val) {
      return `Week ${this.$moment(val).isoWeek()}`;
    }
  }
};
</script>