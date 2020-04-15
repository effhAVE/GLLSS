<template>
  <v-card
    color="primary"
    width="250px"
    class="flex-shrink-0 mr-4 mb-4 fill-height has-border"
    outlined
  >
    <div class="primary darken-1" style="height: 125px">
      <v-card-title>
        {{ round.name }}
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-subtitle class="oneline-text"
        ><router-link :to="`/tournaments/${round.tournamentID}`">{{
          round.tournamentName
        }}</router-link>
        <br />
        {{ round.startDate | moment("MMM Do LT") }}
        <br />
        Best of: {{ round.bestOf }}
      </v-card-subtitle>
    </div>
    <v-card-text class="pa-0">
      <HostsTables
        :round="round"
        @changesMade="onBalanceChange"
        @excludedAdd="onExcludedAdd"
        @excludedRemove="onExcludedRemove"
      />
    </v-card-text>
  </v-card>
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
    }
  },
  data() {
    return {
      changesMade: false,
      excluded: []
    };
  },
  methods: {
    onBalanceChange(payload) {
      this.changesMade = true;
      this.$emit("balanceChange", payload);
    },
    onChange() {
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