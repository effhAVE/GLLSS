<template>
  <v-sheet color="transparent">
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
              <td>{{ host.current || 0 }}</td>
              <td>{{ host.lost || 0 }}</td>
              <td>{{ (host.current || 0) - (host.lost || 0) }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
  </v-sheet>
</template>
<script>
export default {
  props: {
    week: Number
  },
  data() {
    return {
      balance: {
        "-1": null,
        0: null,
        1: null
      }
    };
  },
  computed: {
    nonEmptyGames() {
      const computedObject = {};
      if (!this.balance[this.week]) return computedObject;

      for (const [name, value] of Object.entries(this.balance[this.week])) {
        if (Object.values(value).length) {
          computedObject[name] = value;
        }
      }

      return computedObject;
    }
  },
  methods: {
    getBalance(week = 0) {
      const APIURL = process.env.VUE_APP_APIURL;
      if (this.balance[week]) return;

      this.$http
        .get(`${APIURL}/data/schedule/?week=${week}`)
        .then(response => {
          this.balance[week] = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  created() {
    this.getBalance();
  },
  watch: {
    week(newValue) {
      this.getBalance(newValue);
    }
  }
};
</script>