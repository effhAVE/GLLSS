<template>
  <v-tab-item>
    <v-snackbar
      v-model="changedRounds.length"
      color="secondary border--accent"
      bottom
      right
      multi-line
      :timeout="0"
    >
      Do you want to save the changes?
      <v-btn text color="accent" @click="saveChanges">
        Save
      </v-btn>
    </v-snackbar>
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
            <h4 class="subtitle">
              {{ day | moment("LL") }} - {{ day | moment("dddd") }}
            </h4>
            <div class="d-flex overflow-x-auto mb-8">
              <Round
                v-for="round in rounds"
                :key="round._id"
                :round="round"
                @roundChanged="addChanged"
                @balanceChange="
                  $emit('balanceChange', { ...$event, game: gameObject.game })
                "
              />
            </div>
          </div>
        </div>
      </v-tab-item>
      <v-tab-item v-for="gameObject in groupedRounds" :key="gameObject.game">
        <h3 class="title accent--text">{{ gameObject.game }}</h3>
        <div v-for="(rounds, day) in gameObject.rounds" :key="day">
          <h4 class="subtitle">
            {{ day | moment("LL") }} - {{ day | moment("dddd") }}
          </h4>
          <div class="d-flex overflow-x-auto mb-8">
            <Round
              v-for="round in rounds"
              :key="round._id"
              :round="round"
              @roundChanged="addChanged"
              @balanceChange="
                $emit('balanceChange', { ...$event, game: gameObject.game })
              "
            />
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </v-tab-item>
</template>
<script>
import Round from "./RoundSimplified";
import availabilityGroup from "../../helpers/availabilityGroup";
export default {
  props: {
    week: Number
  },
  components: {
    Round
  },
  data() {
    return {
      groupedRounds: [],
      availabilityList: [],
      changedRounds: [],
      gamesTab: null
    };
  },
  methods: {
    addChanged(roundObject) {
      const existingRound = this.changedRounds.some(
        changedRound => changedRound.round._id === roundObject.round._id
      );

      if (existingRound) {
        this.changedRounds = this.changedRounds.filter(
          changedRound => changedRound.round._id !== roundObject.round._id
        );
      }

      this.changedRounds.push(roundObject);
    },
    getRounds(week = 0) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.availabilityList = [];
      this.$http.get(`${APIURL}/schedules/?week=${week}`).then(response => {
        this.groupedRounds = response.data;
        this.groupedRounds.forEach(gameObject => {
          for (const rounds of Object.values(gameObject.rounds)) {
            rounds.forEach(round => {
              round.available.sort((a, b) =>
                a.nickname.localeCompare(b.nickname)
              );

              let names = round.available.map(host => host.nickname);
              let teamLeads = round.teamLeads.map(
                TLObject => TLObject.host.nickname
              );
              let hosts = round.hosts.map(
                hostObject => hostObject.host.nickname
              );

              this.availabilityList.push({
                roundStartDate: round.startDate,
                roundLocalStartDate: round.localStartDate,
                hosts,
                teamLeads,
                names,
                game: gameObject.game,
                bestOf: round.bestOf
              });
            });
          }
        });

        this.availabilityList = availabilityGroup(this.availabilityList, week);
        this.$emit("scheduleList", this.availabilityList);
      });
    },
    saveChanges() {
      const APIURL = process.env.VUE_APP_APIURL;
      let rounds = [];
      this.changedRounds.forEach(el => {
        const { teamLeads, hosts, available, tournamentID, _id } = el.round;
        rounds.push({
          round: {
            teamLeads,
            hosts,
            available,
            _id
          },
          excluded: el.excluded,
          tournamentID: tournamentID
        });
      });

      this.changedRounds.splice(0);
      this.$http
        .put(`${APIURL}/schedules`, rounds)
        .then(() => {
          this.$store.commit("snackbarMessage", {
            message: "Rounds updated!",
            type: "success"
          });
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: "Error while saving rounds.",
            type: "error"
          })
        );
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