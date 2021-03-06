<template>
  <v-card height="100%" color="transparent">
    <v-row justify="center">
      <v-dialog v-model="calculateDialog" persistent max-width="600px">
        <ValuesForm @submit="recalculate" @cancel="calculateDialog = false" />
      </v-dialog>
    </v-row>
    <v-card-title>
      {{ dataObject.date | moment("MMMM YYYY") }} data
      <v-spacer></v-spacer>
      <div>
        <v-btn color="accent" class="black--text mr-4" @click="calculateDialog = true" v-if="$store.getters.hasPermission('data.update')"
          >(Re)Calculate</v-btn
        >
        <v-btn color="accent" class="black--text" @click="downloadLog" v-if="$store.getters.hasPermission('data.viewLogs')">
          <v-icon left dark>mdi-download</v-icon>
          Download logs
        </v-btn>
      </div>
    </v-card-title>
    <v-tabs fixed-tabs v-model="tab" background-color="secondary" v-if="dataObject.calculation && dataObject.calculation.hosts">
      <v-tab> Overview </v-tab>
      <v-tab> Games summary </v-tab>
      <v-tab> Stats </v-tab>
    </v-tabs>
    <v-alert outlined type="warning" color="accent" v-else> No calculation available at the moment. </v-alert>
    <v-tabs-items v-model="tab" class="transparent" v-if="dataObject.calculation && dataObject.calculation.hosts" touchless>
      <v-tab-item>
        <v-card flat color="transparent">
          <v-data-table
            class="table-background table-simple not-editable text-center"
            :headers="dataHeaders"
            :items="convertDataToArray(dataObject.calculation.hosts.summary)"
            no-data-text="No data"
            item-key="_id"
            hide-default-footer
            disable-pagination
          >
            <template v-slot:item.name="{ value }">
              <strong class="username" v-if="value !== $store.state.user.nickname">{{ value }}</strong>
              <strong class="username" v-else>
                <span class="accent--text font-weight-bold">
                  <v-icon color="accent" small>mdi-account-arrow-left</v-icon>
                  {{ value }}
                </span>
              </strong>
            </template>
          </v-data-table>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-tabs v-model="gamesTab" background-color="primary" slider-color="accent">
          <v-tab v-for="(value, game) in gameSpecificValues" :key="game"> {{ game }}</v-tab>
        </v-tabs>
        <v-card flat color="transparent">
          <v-tabs-items v-model="gamesTab" class="transparent" touchless>
            <v-tab-item v-for="(gameValues, game) in gameSpecificValues" :key="game">
              <v-data-table
                class="table-background table-simple not-editable text-center"
                :headers="dataHeaders"
                :items="convertDataToArray(gameValues.total)"
                no-data-text="No data"
                item-key="_id"
                hide-default-footer
                disable-pagination
              >
                <template v-slot:item.name="{ value }">
                  <strong class="username" v-if="value !== $store.state.user.nickname">{{ value }}</strong>
                  <strong class="username" v-else>
                    <span class="accent--text font-weight-bold">
                      <v-icon color="accent" small>mdi-account-arrow-left</v-icon>
                      {{ value }}
                    </span>
                  </strong>
                </template>
                <template v-slot:body.append>
                  <tr>
                    <th>Game value</th>
                    <td colspan="5" align="center">
                      {{ gameValues.gameValue }}
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-tabs v-model="statsTab" background-color="primary" slider-color="accent">
          <v-tab>Regions</v-tab>
          <v-tab>Games</v-tab>
          <v-tab>Total</v-tab>
        </v-tabs>
        <v-tabs-items v-model="statsTab" class="transparent" touchless>
          <v-card flat color="transparent">
            <v-tab-item>
              <v-simple-table class="table-background table-simple not-editable text-center">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Games hosted</th>
                      <th>Total value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(values, region) in dataObject.calculation.regions" :key="region">
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
              <v-simple-table class="table-background table-simple not-editable text-center">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Region | Games hosted</th>
                      <th>Games hosted</th>
                      <th>Teamlead time</th>
                      <th>Hosting value</th>
                      <th>Teamlead value</th>
                      <th>Total value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(values, game) in dataObject.calculation.games" :key="game">
                      <th>
                        {{ game }}
                      </th>
                      <td>
                        <v-simple-table class="my-4 table-background table-simple text-center">
                          <tbody>
                            <tr v-for="(value, name) in values.regions" :key="name">
                              <th>
                                {{ name }}
                              </th>
                              <td width="100px">
                                {{ value }}
                              </td>
                            </tr>
                          </tbody>
                        </v-simple-table>
                      </td>

                      <td>{{ values.gamesHosted }}</td>
                      <td>{{ values.TLTime }}</td>
                      <td>{{ values.totalHosting }}</td>
                      <td>{{ values.totalLeading }}</td>
                      <td>{{ values.totalValue }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-tab-item>
            <v-tab-item>
              <v-simple-table class="table-background table-simple not-editable text-center">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Games hosted</th>
                      <td>{{ dataObject.calculation.total.gamesHosted }}</td>
                    </tr>
                    <tr>
                      <th>Hosting</th>
                      <td>{{ dataObject.calculation.total.hostingValue }}</td>
                    </tr>
                    <tr>
                      <th>Leading</th>
                      <td>{{ dataObject.calculation.total.leadingValue }}</td>
                    </tr>
                    <tr>
                      <th>Total</th>
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
      gameSpecificValues: {},
      dataHeaders: [
        {
          text: "User",
          value: "name",
          sortable: false
        },
        { text: "Games hosted", value: "games", align: "center" },
        { text: "Host value", value: "hostValue", align: "center" },
        { text: "Teamlead time", value: "TLTime", align: "center" },
        { text: "Teamlead value", value: "TLValue", align: "center" },
        { text: "Total value", value: "totalValue", align: "center", class: "accent darken-1 black--text" }
      ]
    };
  },
  methods: {
    convertDataToArray(dataObject) {
      const array = [];
      if (!dataObject) return [];
      for (const [name, values] of Object.entries(dataObject)) {
        array.push({ name: name, ...values });
      }

      return array;
    },
    getData(date) {
      if (this.$store.getters.hasPermission("data.viewAll")) {
        this.$http
          .get(`${this.APIURL}/data/${date}`)
          .then(response => {
            if (response.status >= 400) throw new Error(response.data);
            this.dataObject = response.data.data;
            if (!this.dataObject.calculation || !this.dataObject.calculation.hosts) return;
            const { ["summary"]: _, ...games } = this.dataObject.calculation.hosts;

            this.gameSpecificValues = games;
          })
          .catch(error => {
            this.$store.commit("snackbarMessage", {
              type: "error",
              message: error
            });
          });
      } else {
        this.$http
          .get(`${this.APIURL}/data/${date}/my`)
          .then(response => {
            if (response.status >= 400) throw new Error(response.data);
            this.dataObject = response.data;
            if (!this.dataObject.calculation) return;
            const { ["summary"]: _, ...games } = this.dataObject.calculation.hosts;
            this.gameSpecificValues = games;
          })
          .catch(error => {
            this.$store.commit("snackbarMessage", {
              type: "error",
              message: error
            });
          });
      }
    },
    recalculate(values) {
      this.$http
        .post(`${this.APIURL}/data/${this.date}/calculate`, {
          gameValues: values.gameValues,
          TLRatio: values.TLRatio
        })
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
      this.$http({
        url: `${this.APIURL}/data/${this.date}/log`,
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

.username {
  font-size: 0.75rem;
}
</style>