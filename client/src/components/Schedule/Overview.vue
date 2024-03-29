<template>
  <div>
    <v-snackbar v-model="changedRounds.length" color="secondary border--accent" bottom right multi-line :timeout="0">
      Do you want to save the changes?
      <v-btn text color="accent" @click="saveChanges">
        Save
      </v-btn>
    </v-snackbar>
    <v-snackbar v-model="collisionsWarning" color="warning" bottom right multi-line :timeout="0">
      Collisions were found. Do you want to see them?
      <v-btn
        text
        color="black"
        @click="
          showCollisionsSummary = true;
          collisionsWarning = false;
        "
      >
        Show
      </v-btn>
      <v-btn text color="secondary" @click="collisionsWarning = false">
        Close
      </v-btn>
    </v-snackbar>
    <CollisionsSummary :collisions="collisions" :show="showCollisionsSummary" @close="showCollisionsSummary = false" />
    <v-tabs v-model="gamesTab" background-color="primary" slider-color="accent">
      <v-tab>All</v-tab>
      <v-tab v-for="gameObject in groupedRounds" :key="gameObject.game">
        {{ gameObject.game }}
      </v-tab>
      <v-spacer></v-spacer>
      <v-btn @click="showCollisionsSummary = true" v-if="collisions.length" text color="warning" large>Show collisions</v-btn>
    </v-tabs>
    <v-tabs-items v-model="gamesTab" class="py-4" touchless>
      <v-tab-item>
        <div v-for="gameObject in groupedRounds" :key="gameObject.game">
          <h3 class="title accent--text">{{ gameObject.game }}</h3>
          <div v-for="(rounds, day) in gameObject.rounds" :key="day">
            <h4 class="subtitle">{{ day | moment("LL") }} - {{ day | moment("dddd") }}</h4>
            <div class="d-flex overflow-x-auto mb-8">
              <Round
                v-for="round in rounds"
                :key="round._id"
                :round="round"
                :game="gameObject.game"
                @roundChanged="addChanged"
                @balanceChange="$emit('balanceChange', { ...$event, game: gameObject.game })"
              />
            </div>
          </div>
        </div>
      </v-tab-item>
      <v-tab-item v-for="gameObject in groupedRounds" :key="gameObject.game">
        <h3 class="title accent--text">{{ gameObject.game }}</h3>
        <div v-for="(rounds, day) in gameObject.rounds" :key="day">
          <h4 class="subtitle">{{ day | moment("LL") }} - {{ day | moment("dddd") }}</h4>
          <div class="d-flex overflow-x-auto mb-8">
            <Round
              v-for="round in rounds"
              :key="round._id"
              :round="round"
              @roundChanged="addChanged"
              @balanceChange="$emit('balanceChange', { ...$event, game: gameObject.game })"
            />
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script>
import Round from "./RoundSimplified";
import availabilityGroup from "../../helpers/availabilityGroup";
import CollisionsSummary from "./CollisionsSummary";
export default {
  props: {
    week: Number
  },
  components: {
    Round,
    CollisionsSummary
  },
  data() {
    return {
      groupedRounds: [],
      availabilityList: [],
      changedRounds: [],
      gamesTab: null,
      collisions: [],
      collisionsWarning: false,
      showCollisionsSummary: false
    };
  },
  methods: {
    addChanged(roundObject) {
      const existingRound = this.changedRounds.some(changedRound => changedRound.round._id === roundObject.round._id);

      if (existingRound) {
        this.changedRounds = this.changedRounds.filter(changedRound => changedRound.round._id !== roundObject.round._id);
      }

      this.changedRounds.push(roundObject);
    },
    getRounds(week = 0) {
      const utc = this.$moment()
        .utc()
        .isoWeek();
      const now = this.$moment(this.$store.state.now)
        .add(week, "weeks")
        .isoWeek();
      const utcWeekDifference = now - utc;
      this.availabilityList = [];
      this.$http.get(`${this.APIURL}/schedules/?week=${utcWeekDifference}`).then(response => {
        this.groupedRounds = response.data;
        this.groupedRounds.forEach(gameObject => {
          for (const rounds of Object.values(gameObject.rounds)) {
            rounds.forEach(round => {
              round.available.sort((a, b) => a.nickname.localeCompare(b.nickname));

              let names = round.available.map(host => host.nickname);
              let teamLeads = round.teamLeads.map(TLObject => TLObject.host.nickname);
              let hosts = round.hosts.map(hostObject => hostObject.host.nickname);

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

        this.availabilityList = availabilityGroup(this.availabilityList);
        this.$emit("scheduleList", this.availabilityList);
      });
    },
    saveChanges() {
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
        .put(`${this.APIURL}/schedules`, rounds)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Rounds updated!",
            type: "success"
          });

          if (response.data.length) {
            this.collisionsWarning = true;
            this.collisions = response.data;
          }
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