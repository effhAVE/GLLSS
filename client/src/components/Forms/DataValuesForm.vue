<template>
  <v-card color="primary" flat>
    <v-card-title>
      Calculation values
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-for="game in gamesList"
          :key="game.name"
          v-model.number="game.value"
          color="accent"
          :label="game.name"
          required
          type="number"
          :rules="validation"
        ></v-text-field>
        <v-text-field v-model="TLRatio" color="accent" label="Teamleads value" required type="number" :rules="TLRatioValidations"> </v-text-field>
      </v-form>
      <span class="warning--text">
        This operation is API intensive and may take up to a few seconds. Please do not overuse it
      </span>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="$emit('cancel')">
        Cancel
      </v-btn>
      <v-btn color="success" text @click="submitGames" :disabled="!valid">
        Calculate
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      gamesList: [],
      gameValues: null,
      TLRatio: 100,
      valid: true,
      validation: [v => !!v || "All game values are required", v => v > 0 || "Game value must be positive"],
      TLRatioValidations: [v => !!v || "Teamleads value is required", v => v > 0 || "Teamleads value must be positive"]
    };
  },
  methods: {
    submitGames() {
      const gameValues = {};
      this.gamesList.forEach(game => {
        gameValues[game.name] = game.value;
      });

      this.$emit("submit", { gameValues, TLRatio: this.TLRatio });
    }
  },
  mounted() {
    this.$http
      .get(`${this.APIURL}/data/gamevalues`)
      .then(response => {
        this.gameValues = response.data;
        this.$http.get(`${this.APIURL}/collections/games`).then(response => {
          this.gamesList = response.data.map(game => {
            return (game = { name: game, value: this.gameValues[game] || 70 });
          });
        });
      })
      .catch(error => {
        this.$store.commit("snackbarMessage", {
          type: "error",
          message: "No game values found."
        });
      });
  }
};
</script>