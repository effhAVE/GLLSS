<template>
  <v-sheet color="transparent" v-if="balance">
    <v-card-text v-for="(gameObject, game) in nonEmptyGames" :key="game">
      <h3 class="title">{{ game }}</h3>
      <v-simple-table class="table-background table-simple not-editable mb-4">
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
            <tr v-for="(host, hostName) in gameObject" :key="hostName">
              <th>{{ hostName }}</th>
              <td>{{ host.current }}</td>
              <td>{{ host.lost }}</td>
              <td>{{ host.current - host.lost }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
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
      for (const [name, value] of Object.entries(this.balanceData)) {
        if (Object.values(value).length) {
          computedObject[name] = value;
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