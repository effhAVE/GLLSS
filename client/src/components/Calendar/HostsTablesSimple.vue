<template>
  <div>
    <v-data-table
      :headers="headerHosts"
      :items="notLostHosting"
      v-bind="tableSettings"
      class="table-background table-shrinked overflow-hidden not-editable"
      no-data-text="No hosts set."
    >
      <template v-slot:item.host="{ item }">
        <div class="px-4">
          <div class="overline accent--text mr-2">
            <span v-if="game !== 'Autochess'">{{ item.groupName.replace("index", round.hosts.indexOf(item) + 1) }}</span>
            <span v-else>
              {{ item.groupName.replace("index", `${round.hosts.indexOf(item) * 4 + 1}-${round.hosts.indexOf(item) * 4 + 4}`) }}
            </span>
          </div>
          <span :class="item.host.nickname === user.nickname ? 'accent--text' : ''">{{ item.host.nickname }}</span>

          <div class="ml-auto">
            <div v-if="+item.timeBalance" class="icon-size" :class="item.timeBalance > 0 ? 'success--text' : 'error--text'">
              <span v-if="item.timeBalance > 0">+</span>{{ item.timeBalance }}
            </div>
            <v-icon color="accent" small v-if="item.host.nickname === user.nickname">mdi-account</v-icon>
          </div>
        </div>
      </template>
    </v-data-table>
    <v-data-table
      :headers="headerTLs"
      :items="notLostLeading"
      v-bind="tableSettings"
      class="mt-4 table-background table-shrinked overflow-hidden not-editable"
      no-data-text="No team leads set."
    >
      <template v-slot:item.teamLeads="{ item }">
        <div class="px-4">
          <span :class="item.host.nickname === user.nickname ? 'accent--text' : ''">{{ item.host.nickname }}</span>

          <div class="ml-auto">
            <div v-if="+item.timeBalance" class="icon-size" :class="item.timeBalance > 0 ? 'success--text' : 'error--text'">
              <span v-if="item.timeBalance > 0">+</span>{{ item.timeBalance }}
            </div>
            <v-icon color="accent" small v-if="item.host.nickname === user.nickname">mdi-account</v-icon>
          </div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  props: {
    round: Object,
    user: Object,
    game: String
  },
  data() {
    return {
      headerHosts: [
        {
          text: "Hosts",
          value: "host",
          align: "center"
        }
      ],
      headerTLs: [
        {
          text: "Team leads",
          value: "teamLeads",
          align: "center"
        }
      ],
      tableSettings: {
        disablePagination: true,
        "disable-sort": true,
        "hide-default-footer": true,
        dense: true
      }
    };
  },
  computed: {
    notLostHosting() {
      return this.round.hosts.filter(hostObject => !hostObject.lostHosting);
    },
    notLostLeading() {
      return this.round.teamLeads.filter(hostObject => !hostObject.lostLeading);
    }
  }
};
</script>