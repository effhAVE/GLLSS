<template>
  <v-sheet color="transparent">
    <v-row class="ma-0">
      <v-spacer></v-spacer>
      <v-btn text color="accent" @click="$emit('getBalance')">Recalculate</v-btn>
    </v-row>
    <v-simple-table class="table-background table-simple not-editable mb-4 availability-table" dense v-if="Object.values(nonEmptyGames).length">
      <template v-slot:default>
        <thead>
          <th>
            User
          </th>
          <th class="px-1">
            <table style="table-layout: fixed;">
              <tr>
                <td :colspan="Object.values(nonEmptyGames).length + 1" class="text-center">Current week value</td>
              </tr>
              <tr class="text-center">
                <td v-for="(values, game) in nonEmptyGames" :key="game">{{ game }}</td>
                <td>Total</td>
              </tr>
            </table>
          </th>
          <th>
            Lost leading
          </th>
          <th>
            Difference
          </th>
        </thead>
        <tbody>
          <tr v-for="(host, hostName) in balanceData.total" :key="host.name">
            <th>{{ hostName }}</th>
            <td>
              <table style="table-layout: fixed">
                <tr>
                  <td v-for="(values, game) in nonEmptyGames" :key="game">{{ values[hostName] || 0 }}</td>
                  <td>{{ host.current }}</td>
                </tr>
              </table>
            </td>
            <td>{{ host.lost }}</td>
            <td>{{ host.current - host.lost }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-sheet>
</template>
<script>
export default {
  // prop without a type as null value throws a warning
  props: ["balance"],
  data() {
    return {
      balanceData: this.balance
    };
  },
  computed: {
    nonEmptyGames() {
      const computedObject = {};
      if (!this.balanceData) return {};
      for (const [name, hosts] of Object.entries(this.balanceData)) {
        if (Object.values(hosts).length) {
          computedObject[name] = this.balanceData[name];
        }
      }

      delete computedObject.total;
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