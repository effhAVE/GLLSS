<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Schedule
      <v-spacer></v-spacer>
      <v-select
        :items="weeks"
        label="Select week"
        color="accent"
        v-model="selectedWeek"
        class="flex-grow-0"
      ></v-select>
    </v-card-title>
    <v-btn
      color="accent black--text"
      fixed
      bottom
      left
      fab
      @click="modal = !modal"
    >
      <v-icon>mdi-calculator</v-icon>
    </v-btn>
    <v-tabs fixed-tabs v-model="tab" background-color="secondary">
      <v-tab>
        Scheduling
      </v-tab>
      <v-tab>
        Balance
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" class="transparent">
      <v-tab-item>
        <ScheduleTable @scheduleList="onAvailableList" :week="selectedWeek" />
      </v-tab-item>
      <v-tab-item>
        <BalanceTable :week="selectedWeek" />
      </v-tab-item>
    </v-tabs-items>
    <!-- <v-navigation-drawer
      v-model="modal"
      color="primary lighten-1"
      right
      fixed
      clipped
    >
      <pre>
        {{ availableList }}
      </pre>
    </v-navigation-drawer> -->
  </v-card>
</template>
<script>
import ScheduleTable from "../components/Schedule/Overview";
import BalanceTable from "../components/Schedule/Balance";
export default {
  components: {
    ScheduleTable,
    BalanceTable
  },
  data() {
    return {
      modal: false,
      availableList: [],
      selectedWeek: 0,
      weeks: [
        { text: "Current", value: 0 },
        { text: "Previous", value: -1 },
        { text: "Next", value: 1 }
      ],
      tab: null
    };
  },
  methods: {
    onAvailableList(list) {
      this.availableList = list;
      this.modal = true;
    }
  }
};
</script>