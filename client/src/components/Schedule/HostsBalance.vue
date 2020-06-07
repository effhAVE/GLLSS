<template>
  <v-sheet color="transparent">
    <v-tabs v-model="balanceTab" background-color="primary" slider-color="accent">
      <v-tab v-for="(gameObject, game) in nonEmptyGames" :key="game">
        {{ game }}
      </v-tab>
      <v-spacer></v-spacer>
      <v-btn text color="accent" @click="$emit('getBalance')">Recalculate</v-btn>
    </v-tabs>
    <v-row class="ma-0"> </v-row>
    <v-tabs-items v-model="balanceTab" class="py-4">
      <v-tab-item v-for="(gameObject, game) in nonEmptyGames" :key="game">
        <v-card-text>
          <v-row>
            <v-col cols="6" v-for="(hostsList, index) in gameObject" :key="index">
              <v-data-table
                class="table-background table-simple not-editable text-center"
                :headers="headers"
                :items="hostsList"
                no-data-text="No data"
                item-key="name"
                hide-default-footer
                disable-pagination
                dense
              >
                <template v-slot:item.name="{ value }">
                  <strong class="username">{{ value }}</strong>
                </template>
                <template v-slot:item.values="{ item }">
                  {{ item.values.current - item.values.lost }}
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
  </v-sheet>
</template>
<script>
export default {
  // prop without a type as null value throws a warning
  props: ["balance"],
  data() {
    return {
      balanceData: this.balance,
      balanceTab: null,
      headers: [
        {
          text: "User",
          value: "name"
        },
        {
          text: "Current week value",
          value: "values.current"
        },
        {
          text: "Lost hosting",
          value: "values.lost"
        },
        {
          text: "Difference",
          value: "values",
          sort(a, b) {
            return a.current - a.lost - (b.current - b.lost);
          }
        }
      ]
    };
  },
  computed: {
    nonEmptyGames() {
      const computedObject = {};
      if (!this.balanceData) return {};
      for (const [name, hosts] of Object.entries(this.balanceData)) {
        if (Object.values(hosts).length) {
          const splitPoint = Math.ceil(Object.values(hosts).length / 2);
          const hostsArray = Object.entries(hosts).map(([name, values]) => ({ name: name, values: values }));
          computedObject[name] = [hostsArray.slice(0, splitPoint), hostsArray.slice(splitPoint)];
        }
      }

      return computedObject;
    }
  },
  watch: {
    balance: {
      handler: function(newValue) {
        this.balanceData = newValue;
      },
      deep: true
    }
  }
};
</script>