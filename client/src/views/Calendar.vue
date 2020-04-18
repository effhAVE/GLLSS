<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Calendar
      <v-spacer></v-spacer>
      <v-select
        :items="weeks"
        label="Select week"
        color="accent"
        v-model="selectedWeek"
        class="flex-grow-0"
      ></v-select>
    </v-card-title>
    <CalendarTable :week="selectedWeek" :user="user" />
  </v-card>
</template>
<script>
import CalendarTable from "../components/Calendar/Overview";
export default {
  props: {
    user: Object
  },
  components: {
    CalendarTable
  },
  data() {
    return {
      selectedWeek: 0,
      weeks: [
        { text: "Current", value: 0 },
        { text: "Previous", value: -1 },
        { text: "Next", value: 1 }
      ]
    };
  }
};
</script>