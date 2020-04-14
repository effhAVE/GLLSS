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
      disabled
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
      <ScheduleTable
        @scheduleList="onAvailableList"
        @balanceChange="calculateChange"
        :week="selectedWeek"
      />
      <v-tab-item>
        <BalanceTable :balance="balance[selectedWeek]" />
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
      tab: null,
      balance: {
        "-1": null,
        0: null,
        1: null
      },
      gameValues: {}
    };
  },
  methods: {
    calculateChange(change) {
      const { type, oldHost, newHost, host, game, bestOf } = change;
      const value = this.gameValues[game] * bestOf;
      if (type === "hostChange") {
        this.balance[this.selectedWeek][game][
          oldHost.nickname
        ].current -= value;

        if (newHost) {
          this.balance[this.selectedWeek][game][
            newHost.nickname
          ].current += value;
        }
      } else if (type === "hostAdd") {
        if (!this.balance[this.selectedWeek][game][host.nickname]) {
          this.$set(this.balance[this.selectedWeek][game], host.nickname, {
            lost: 0,
            current: value
          });
        } else {
          this.balance[this.selectedWeek][game][host.nickname].current += value;
        }
      }
    },
    getBalance(week = 0) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/data/schedule/?week=${week}`)
        .then(response => {
          this.balance[week] = response.data;
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message:
              error.response.data || "Error while fetching balance values."
          });
        });
    },
    onAvailableList(list) {
      this.availableList = list;
      this.modal = true;
    }
  },
  created() {
    this.getBalance();
  },
  mounted() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http
      .get(`${APIURL}/data/gamevalues`)
      .then(response => {
        this.gameValues = response.data;
      })
      .catch(error => {
        this.$store.commit("snackbarMessage", {
          type: "error",
          message: "No game values found. Balance won't be working."
        });
      });
  },
  watch: {
    selectedWeek(newValue) {
      if (this.balance[newValue]) return;
      this.getBalance(newValue);
    }
  }
};
</script>