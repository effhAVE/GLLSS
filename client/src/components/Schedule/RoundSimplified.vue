<template>
  <v-lazy
    v-model="lazy"
    :options="{
      threshold: 0.5
    }"
    class="flex-shrink-0 mr-4 mb-4 fill-height has-border v-card v-card--outlined v-sheet theme--dark primary"
  >
    <div>
      <div class="primary darken-1" style="height: 125px">
        <v-card-title>
          {{ round.name }}
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-subtitle class="oneline-text"
          ><router-link :to="`/tournaments/${round.tournamentID}`">{{ round.tournamentName }}</router-link>
          <br />
          {{ round.startDate | moment("MMM Do HH:mm") }}
          <br />
          Best of: {{ round.bestOf }} <span class="accent--text">|</span> Prep. time: {{ round.prepTime }} min.
        </v-card-subtitle>
      </div>
      <v-card-text class="pa-0">
        <HostsTables
          :round="round"
          :game="game"
          :isPast="isPast"
          @changesMade="onBalanceChange"
          @excludedAdd="onExcludedAdd"
          @excludedRemove="onExcludedRemove"
          @userUpdate="onChange"
        />
      </v-card-text>
    </div>
  </v-lazy>
</template>

<script>
import HostsTables from "./HostsTables";
export default {
  components: {
    HostsTables
  },
  props: {
    round: {
      type: Object,
      required: true
    },
    game: {
      type: String
    }
  },
  data() {
    return {
      lazy: false,
      changesMade: false,
      excluded: []
    };
  },
  computed: {
    isPast() {
      return this.$moment(this.round.endDate).isSameOrBefore(this.$store.state.now);
    }
  },
  methods: {
    onBalanceChange(payload) {
      this.changesMade = true;
      this.$emit("balanceChange", payload);
    },
    onChange() {
      this.changesMade = false;
      this.$emit("roundChanged", {
        round: this.round,
        excluded: this.excluded
      });
    },
    onExcludedAdd(host) {
      this.excluded.push(host);
    },
    onExcludedRemove(host) {
      this.excluded = this.excluded.filter(hostObj => hostObj !== host);
    }
  },
  watch: {
    changesMade(newValue) {
      if (newValue === true) {
        this.onChange();
      }
    }
  }
};
</script>

<style lang="scss">
.oneline-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>