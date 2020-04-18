<template>
  <v-card
    color="primary"
    width="200px"
    class="flex-shrink-0 mr-2 mb-2 fill-height has-border"
    outlined
  >
    <div class="primary darken-1" style="height: 80px">
      <v-card-subtitle class="oneline-text pa-2">
        <v-tooltip bottom color="secondary">
          <template v-slot:activator="{ on }">
            <span v-on="on">
              <router-link
                :to="`/tournaments/${round.tournamentID}`"
                class="caption"
                >{{ round.tournamentName }}</router-link
              >
            </span>
          </template>
          <span>{{ round.tournamentName }}</span>
        </v-tooltip>
        <p class="ma-0 caption">{{ round.name }}</p>
        <p class="ma-0 caption">
          {{ round.startDate | moment("MMM Do LT") }}
          <span class="accent--text">|</span> BO:
          <span class="accent--text">{{ round.bestOf }}</span>
        </p>
      </v-card-subtitle>
    </div>
    <v-card-text class="pa-0">
      <HostsTables :round="round" :user="user" />
    </v-card-text>
  </v-card>
</template>

<script>
import HostsTables from "./HostsTablesSimple";
export default {
  components: {
    HostsTables
  },
  props: {
    round: {
      type: Object,
      required: true
    },
    user: Object
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