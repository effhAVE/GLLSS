<template>
  <v-sheet color="transparent">
    <v-row class="ma-0">
      <v-spacer></v-spacer>
      <v-btn text color="accent" @click="$emit('getBalance')">Recalculate</v-btn>
    </v-row>
    <v-tabs v-model="balanceTab" background-color="primary" slider-color="accent">
      <v-tab v-for="(gameObject, game) in nonEmptyGames" :key="game">
        {{ game }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="balanceTab" class="py-4">
      <v-tab-item v-for="(gameObject, game) in nonEmptyGames" :key="game">
        <v-card-text>
          <v-row>
            <v-col cols="6" v-for="(hostsList, index) in gameObject" :key="index">
              <v-simple-table class="table-background table-simple not-editable mb-4" dense>
                <template v-slot:default>
                  <thead>
                    <th>
                      User
                    </th>
                    <th>
                      Current week value
                    </th>
                    <th>
                      Lost hosting
                    </th>
                    <th>
                      Difference
                    </th>
                  </thead>
                  <tbody>
                    <tr v-for="host in hostsList" :key="host.name">
                      <th>{{ host.name }}</th>
                      <td>{{ host.values.current }}</td>
                      <td>{{ host.values.lost }}</td>
                      <td>{{ host.values.current - host.values.lost }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
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
      balanceTab: null
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