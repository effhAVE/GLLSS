<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Create a tournament
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-form ref="form" style="min-width: 500px">
          <v-text-field
            v-model="draft.name"
            color="accent"
            label="Name"
            prepend-icon="mdi-pencil"
            required
          ></v-text-field>
          <v-select
            :items="seriesList"
            v-model="draft.series"
            label="Series"
            prepend-icon="mdi-view-list"
            color="accent"
          >
            <template v-slot:item="{ item }">
              {{ item.name }}
            </template>
            <template v-slot:selection="{ item }">
              {{ item.name }}
            </template>
          </v-select>
          <v-menu
            v-model="datepickerStart"
            :close-on-content-click="true"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="draft.startDate"
                label="Start date"
                color="accent"
                prepend-icon="mdi-calendar"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="draft.startDate"
              color="secondary"
              @input="datepickerStart = false"
            ></v-date-picker>
          </v-menu>
          <v-menu
            v-model="datepickerEnd"
            :close-on-content-click="true"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="draft.endDate"
                label="End date"
                color="accent"
                prepend-icon="mdi-calendar-check"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="draft.endDate"
              color="secondary"
              @input="datepickerStart = false"
            ></v-date-picker>
          </v-menu>
          <v-select
            :items="gamesList"
            label="Game"
            prepend-icon="mdi-gamepad"
            color="accent"
            :disabled="!!draft.series"
            v-model="draft.game"
          ></v-select>
          <v-select
            :items="regionsList"
            label="Region"
            prepend-icon="mdi-earth"
            color="accent"
            :disabled="!!draft.series"
            v-model="draft.region"
          ></v-select>
          <v-checkbox
            v-model="draft.countedByRounds"
            label="Counted by rounds"
            prepend-icon="mdi-currency-usd"
            color="accent"
          ></v-checkbox>
          <v-btn
            color="accent black--text"
            class="mt-8"
            large
            @click="saveTournament"
          >
            Create!
          </v-btn>
        </v-form>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      datepickerStart: false,
      datepickerEnd: false,
      draft: {
        name: "Unnamed tournament",
        startDate: new Date().toISOString().substr(0, 10),
        endDate: new Date().toISOString().substr(0, 10),
        series: null,
        game: "",
        region: "",
        countedByRounds: true
      },
      regionsList: [],
      gamesList: [],
      seriesList: []
    };
  },
  methods: {
    saveTournament() {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .post(`${APIURL}/tournaments/`, this.draft)
        .then(response => {
          this.$emit("snackbarMessage", {
            message: "Tournament saved!",
            type: "success"
          });
          this.$router.push("/tournaments");
        })
        .catch(error =>
          this.$emit("snackbarMessage", {
            message: "Error while saving.",
            type: "error"
          })
        );
    }
  },
  created() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/collections/games`).then(response => {
      this.gamesList = response.data;
    });

    this.$http.get(`${APIURL}/collections/regions`).then(response => {
      this.regionsList = response.data;
    });

    this.$http.get(`${APIURL}/series/list`).then(response => {
      this.seriesList = response.data;
    });
  }
};
</script>