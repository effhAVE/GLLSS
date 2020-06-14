<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Schedule
      <v-spacer></v-spacer>
      <v-select :items="weeks" label="Select week" color="accent" v-model="selectedWeek" class="flex-grow-0"></v-select>
    </v-card-title>
    <v-btn color="accent black--text" fixed bottom left fab @click="modal = !modal">
      <v-icon>mdi-account-clock</v-icon>
    </v-btn>
    <v-tabs fixed-tabs v-model="tab" background-color="secondary">
      <v-tab>
        Scheduling
      </v-tab>
      <v-tab>
        Hosts balance
      </v-tab>
      <v-tab>
        Teamleads balance
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" class="transparent">
      <v-tab-item>
        <ScheduleTable @scheduleList="onAvailableList" :week="selectedWeek" ref="scheduling" />
      </v-tab-item>
      <v-tab-item>
        <HostsBalance @getBalance="getHostsBalance(selectedWeek)" :balance="hostsBalance[selectedWeek]" />
      </v-tab-item>
      <v-tab-item>
        <TLBalance @getBalance="getTLBalance(selectedWeek)" :balance="TLBalance[selectedWeek]" />
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="modal" width="70%">
      <v-card color="primary">
        <v-card-title class="headline secondary" primary-title>
          Availability table
        </v-card-title>
        <AvailabilityTable :availableList="availableList" :showTeamleads="showTeamleads" :showHosts="showHosts" />
        <v-divider></v-divider>

        <v-card-actions>
          <v-checkbox v-model="showTeamleads" label="Show teamleads" color="accent"></v-checkbox>
          <v-checkbox v-model="showHosts" label="Show hosts" color="accent" class="mx-4"></v-checkbox>
          <v-spacer></v-spacer>
          <v-btn color="accent" text @click="$refs.scheduling.getRounds(selectedWeek)">
            Refresh
          </v-btn>
          <v-btn color="accent" text @click="modal = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import ScheduleTable from "../components/Schedule/Overview";
import HostsBalance from "../components/Schedule/HostsBalance";
import TLBalance from "../components/Schedule/TLBalance";
import AvailabilityTable from "../components/Schedule/AvailabilityTable";
export default {
  components: {
    ScheduleTable,
    HostsBalance,
    TLBalance,
    AvailabilityTable
  },
  data() {
    return {
      showTeamleads: true,
      showHosts: true,
      modal: false,
      availableList: {},
      selectedWeek: 0,
      weeks: [
        { text: "Current", value: 0 },
        { text: "Previous", value: -1 },
        { text: "Next", value: 1 }
      ],
      tab: null,
      hostsBalance: {
        "-1": null,
        0: null,
        1: null
      },
      TLBalance: {
        "-1": null,
        0: null,
        1: null
      },
      gameValues: {}
    };
  },
  methods: {
    getHostsBalance(week = 0) {
      this.$http
        .get(`${this.APIURL}/data/schedule/?week=${week}`)
        .then(response => {
          this.hostsBalance[week] = response.data;
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error.response.data || "Error while fetching balance values."
          });
        });
    },
    getTLBalance(week = 0) {
      this.$http
        .get(`${this.APIURL}/data/schedule/teamleads?week=${week}`)
        .then(response => {
          this.TLBalance[week] = response.data;
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error.response.data || "Error while fetching balance values."
          });
        });
    },
    onAvailableList(list) {
      this.availableList = list;
    }
  },
  mounted() {
    this.$http
      .get(`${this.APIURL}/data/gamevalues`)
      .then(response => {
        this.gameValues = response.data;
      })
      .catch(error => {
        this.$store.commit("snackbarMessage", {
          type: "error",
          message: "No game values found. Balance won't be working."
        });
      });
  }
};
</script>
<style lang="scss">
.availability-table table {
  td {
    padding: 0 4px;
  }

  text-align: center;

  .fixed {
    position: absolute;
    left: auto;
    top: auto;
    border: none !important;
    width: 150px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: auto;
  }

  .has-border {
    border: thin solid rgba(255, 255, 255, 0.13);
  }

  td.has-border-left:not(:first-of-type) {
    border-left: thin solid rgba(255, 255, 255, 0.13);
  }

  .has-border-left-thick {
    border-left-color: rgba(255, 255, 255, 0.5) !important;
  }

  .has-border-thick {
    border-color: rgba(255, 255, 255, 0.5) !important;
  }

  .round-border {
    border-top: thin solid rgba(255, 255, 255, 0.13);
  }

  tr:last-of-type td {
    border-bottom: none !important;
  }
}
</style>