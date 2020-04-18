<template>
  <v-card-text>
    <v-tabs v-model="gamesTab" background-color="primary" slider-color="accent">
      <v-tab>All</v-tab>
      <v-tab v-for="gameObject in groupedRounds" :key="gameObject.game">
        {{ gameObject.game }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="gamesTab" class="py-4">
      <v-tab-item>
        <div v-for="gameObject in groupedRounds" :key="gameObject.game">
          <h3 class="title accent--text">{{ gameObject.game }}</h3>
          <div v-for="(rounds, day) in gameObject.rounds" :key="day">
            <h4 class="subtitle">{{ day | moment("LL") }}</h4>
            <div class="d-flex overflow-x-auto mb-2">
              <Round
                v-for="round in rounds"
                :key="round._id"
                :round="round"
                :user="user"
                :game="gameObject.game"
              />
            </div>
          </div>
        </div>
      </v-tab-item>
      <v-tab-item v-for="gameObject in groupedRounds" :key="gameObject.game">
        <h3 class="title accent--text">{{ gameObject.game }}</h3>
        <div v-for="(rounds, day) in gameObject.rounds" :key="day">
          <h4 class="subtitle">{{ day | moment("LL") }}</h4>
          <div class="d-flex overflow-x-auto mb-2">
            <Round
              v-for="round in rounds"
              :key="round._id"
              :round="round"
              :user="user"
              :game="gameObject.game"
            />
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </v-card-text>
</template>

<script>
import Round from "./CalendarRound";
export default {
  props: {
    week: Number,
    user: Object
  },
  components: {
    Round
  },
  data() {
    return {
      groupedRounds: [],
      gamesTab: null
    };
  },
  methods: {
    getRounds(week = 0) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.get(`${APIURL}/schedules/?week=${week}`).then(response => {
        this.groupedRounds = response.data;
      });
    }
  },
  mounted() {
    this.getRounds();
  },
  watch: {
    week(newWeek) {
      this.getRounds(newWeek);
    }
  }
};
</script>