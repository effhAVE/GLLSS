<template>
  <v-card height="100%" color="transparent" v-if="dataObject.calculation">
    <v-row justify="center">
      <v-dialog v-model="calculateDialog" persistent max-width="600px">
        <ValuesForm @submit="recalculate" @cancel="calculateDialog = false" />
      </v-dialog>
    </v-row>
    <v-card-title>
      {{ dataObject.date | moment("MMMM YYYY") }} data
      <v-spacer></v-spacer>
      <div v-if="user.roles.includes('admin')">
        <v-btn
          color="accent"
          class="black--text mr-4"
          @click="calculateDialog = true"
          >(Re)Calculate</v-btn
        >
        <v-btn color="accent" class="black--text" @click="downloadLog">
          <v-icon left dark>mdi-download</v-icon>
          Download logs
        </v-btn>
      </div>
    </v-card-title>
    <v-tabs
      fixed-tabs
      v-model="tab"
      background-color="secondary"
      v-if="dataObject.calculation.hosts"
    >
      <v-tab>
        Overview
      </v-tab>
      <v-tab>
        Games summary
      </v-tab>
      <v-tab>
        Stats
      </v-tab>
    </v-tabs>
    <v-alert outlined type="warning" color="accent" v-else>
      No calculation available at the moment.
    </v-alert>
    <v-tabs-items v-model="tab" class="transparent">
      <v-tab-item>
        <v-card flat color="transparent">
          <v-simple-table class="table-background table-simple not-editable">
            <template v-slot:default>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Games hosted</th>
                  <th>Host value</th>
                  <th>Teamlead time</th>
                  <th>Teamlead value</th>
                  <th class="accent black--text">Total value</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(host, hostName) in dataObject.calculation.hosts
                    .summary"
                  :key="hostName"
                >
                  <th v-if="hostName !== user.nickname">
                    {{ hostName }}
                  </th>
                  <th v-else>
                    <v-badge dot color="secondary">
                      {{ hostName }}
                    </v-badge>
                  </th>
                  <td>{{ host.games }}</td>
                  <td>{{ host.hostValue }}</td>
                  <td>{{ host.TLTime }}</td>
                  <td>{{ host.TLValue }}</td>
                  <td>{{ host.totalValue }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-tabs
          v-model="gamesTab"
          background-color="primary"
          slider-color="accent"
        >
          <v-tab v-for="(value, game) in gameSpecificValues" :key="game">
            {{ game }}</v-tab
          >
        </v-tabs>
        <v-card flat color="transparent">
          <v-tabs-items v-model="gamesTab" class="transparent">
            <v-tab-item
              v-for="(gameValues, game) in gameSpecificValues"
              :key="game"
            >
              <v-simple-table
                class="table-background table-simple not-editable"
              >
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Games hosted</th>
                      <th>Host value</th>
                      <th>Teamlead time</th>
                      <th>Teamlead value</th>
                      <th class="accent black--text">Total value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(host, hostName) in gameValues.total"
                      :key="hostName"
                    >
                      <th v-if="hostName !== user.nickname">
                        {{ hostName }}
                      </th>
                      <th v-else>
                        <v-badge dot color="secondary">
                          {{ hostName }}
                        </v-badge>
                      </th>
                      <td>{{ host.games }}</td>
                      <td>{{ host.hostValue }}</td>
                      <td>{{ host.TLTime }}</td>
                      <td>{{ host.TLValue }}</td>
                      <td>{{ host.totalValue }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <th>Game value</th>
                    <td colspan="5" align="center">
                      {{ gameValues.gameValue }}
                    </td>
                  </tfoot></template
                >
              </v-simple-table>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-tabs
          v-model="statsTab"
          background-color="primary"
          slider-color="accent"
        >
          <v-tab>Regions</v-tab>
          <v-tab>Games</v-tab>
          <v-tab>Total</v-tab>
        </v-tabs>
        <v-tabs-items v-model="statsTab" class="transparent">
          <v-card flat color="transparent">
            <v-tab-item>
              <v-simple-table
                class="table-background table-simple not-editable"
              >
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Games hosted</th>
                      <th>Total value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(values, region) in dataObject.calculation.regions"
                      :key="region"
                    >
                      <th>
                        {{ region }}
                      </th>
                      <td>{{ values.gamesHosted }}</td>
                      <td>{{ values.totalValue }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-tab-item>
            <v-tab-item>
              <v-simple-table
                class="table-background table-simple not-editable"
              >
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Games hosted</th>
                      <th>Total value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(values, game) in dataObject.calculation.games"
                      :key="game"
                    >
                      <th>
                        {{ game }}
                      </th>
                      <td>{{ values.gamesHosted }}</td>
                      <td>{{ values.totalValue }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-tab-item>
            <v-tab-item>
              <v-simple-table
                class="table-background table-simple not-editable"
              >
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>
                        Games hosted
                      </th>
                      <td>{{ dataObject.calculation.total.gamesHosted }}</td>
                    </tr>
                    <tr>
                      <th>
                        Hosting
                      </th>
                      <td>{{ dataObject.calculation.total.hostingValue }}</td>
                    </tr>
                    <tr>
                      <th>
                        Leading
                      </th>
                      <td>{{ dataObject.calculation.total.leadingValue }}</td>
                    </tr>
                    <tr>
                      <th>
                        Total
                      </th>
                      <td>{{ dataObject.calculation.total.totalValue }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-tab-item>
          </v-card>
        </v-tabs-items>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>
<script>
import ValuesForm from "../../components/Forms/DataValuesForm";
export default {
  props: {
    user: Object
  },
  components: {
    ValuesForm
  },
  data() {
    return {
      date: this.$route.params.date,
      dataObject: {},
      tab: null,
      gamesTab: null,
      statsTab: null,
      calculateDialog: false,
      gameSpecificValues: {}
    };
  },
  methods: {
    getData(date) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/data/${date}`)
        .then(response => {
          this.dataObject = response.data;
          const summaryKey = "summary";
          const {
            ["summary"]: _,
            ...games
          } = this.dataObject.calculation.hosts;
          this.gameSpecificValues = games;
        })
        .catch(error => {
          if (error.response.status === 400) {
            this.$router.push("/notfound");
          }
        });
    },
    recalculate(gameValues) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .post(`${APIURL}/data/${this.date}/calculate`, gameValues)
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error.response.data || `Error while calculating`,
            type: "error"
          });
        })
        .then(() => {
          this.$store.commit("snackbarMessage", {
            message: "Data recalculated successfully!",
            type: "success"
          });
        })
        .then(() => {
          this.$router.go();
        });
    },
    downloadLog() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http({
        url: `${APIURL}/data/${this.date}/log`,
        method: "GET",
        responseType: "blob"
      }).then(response => {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${this.date}-log-${new Date().getTime()}.log`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  },
  watch: {
    "$route.params": {
      handler(newValue) {
        const { date } = newValue;
        if (date) {
          this.getData(date);
        } else {
          this.dataObject = null;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="scss">
.theme--dark.v-tabs-items {
  background-color: transparent;
}
</style>