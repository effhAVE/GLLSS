<template>
  <div>
    <v-data-table
      :headers="headerHosts"
      :items="round.hosts"
      v-bind="tableSettings"
      class="table-background table-shrinked overflow-hidden"
      no-data-text="No hosts set."
    >
      <template v-slot:item.host="{ item }">
        <v-menu bottom left offset-y>
          <template v-slot:activator="{ on }">
            <div class="px-4" v-on="on">
              {{ item.host.nickname }}
              <div class="ml-auto">
                <v-tooltip bottom v-if="item.ready" color="success">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-icon color="success" small>
                        mdi-account-check
                      </v-icon>
                    </span>
                  </template>
                  <span>Ready</span>
                </v-tooltip>
                <v-tooltip bottom v-else color="error">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-icon color="error" small>
                        mdi-account-remove
                      </v-icon>
                    </span>
                  </template>
                  <span>Not ready</span>
                </v-tooltip>
                <v-tooltip bottom v-if="item.lostHosting" color="warning">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-icon color="warning" small>
                        mdi-account-off
                      </v-icon>
                    </span>
                  </template>
                  <span>Lost hosting</span>
                </v-tooltip>
              </div>
            </div>
          </template>
          <v-list>
            <v-list-item
              v-for="(host, i) in ['', ...round.available]"
              :key="i"
              @click="changeRoundHost(round, item.host, host)"
            >
              <v-list-item-title>{{ host.nickname }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:body.append>
        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="success" width="100%" x-small tile>
              Add
            </v-btn>
          </template>
          <v-list v-if="round.available.length">
            <v-list-item
              v-for="(host, i) in round.available"
              :key="i"
              @click="addHostToRound(round, host)"
            >
              <v-list-item-title>{{ host.nickname }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title>No available hosts.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
    <v-data-table
      :headers="headerTLs"
      :items="round.teamLeads"
      v-bind="tableSettings"
      class="mt-8 table-background table-shrinked overflow-hidden"
      no-data-text="No team leads set."
    >
      <template v-slot:item.teamLeads="{ item }">
        <v-menu bottom left offset-y>
          <template v-slot:activator="{ on }">
            <div class="px-4" v-on="on">
              {{ item.host.nickname }}
              <div class="ml-auto">
                <v-tooltip bottom v-if="item.ready" color="success">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-icon color="success" small>
                        mdi-account-check
                      </v-icon>
                    </span>
                  </template>
                  <span>Ready</span>
                </v-tooltip>
                <v-tooltip bottom v-else color="error">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-icon color="error" small>
                        mdi-account-remove
                      </v-icon>
                    </span>
                  </template>
                  <span>Not ready</span>
                </v-tooltip>
                <v-tooltip bottom v-if="item.lostLeading" color="warning">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-icon color="warning" small>
                        mdi-account-off
                      </v-icon>
                    </span>
                  </template>
                  <span>Lost leading</span>
                </v-tooltip>
              </div>
            </div>
          </template>
          <v-list>
            <v-list-item
              v-for="(host, i) in ['', ...availableTLs]"
              :key="i"
              @click="changeRoundTL(round, item.host, host)"
            >
              <v-list-item-title>{{ host.nickname }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:body.append>
        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="success" width="100%" x-small tile>
              Add
            </v-btn>
          </template>
          <v-list v-if="availableTLs.length">
            <v-list-item
              v-for="(host, i) in availableTLs"
              :key="i"
              @click="addTLToRound(round, host)"
            >
              <v-list-item-title>{{ host.nickname }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title>No available teamleaders.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  props: {
    round: Object
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
      },
      excludedHosts: []
    };
  },
  computed: {
    availableTLs() {
      return this.round.available.filter(host =>
        host.roles.includes("teamleader")
      );
    }
  },
  methods: {
    changeRoundHost(round, oldHost, newHost) {
      this.$emit("changesMade");
      const arrayIndex = round.hosts.findIndex(
        el => el.host._id === oldHost._id
      );

      round.available.push(oldHost);
      if (newHost === "") {
        if (!this.excludedHosts.some(hostObj => hostObj === oldHost))
          this.$emit("excludedAdd", oldHost);
        return round.hosts.splice(arrayIndex, 1);
      }

      round.hosts.splice(arrayIndex, 1, {
        host: newHost,
        lostHosting: false,
        ready: false
      });
    },
    addHostToRound(round, hostAdded) {
      this.$emit("changesMade");
      round.hosts.push({ host: hostAdded, ready: false, lostHosting: false });
      round.available = round.available.filter(host => host !== hostAdded);
      this.$emit("excludedRemove", hostAdded);
    },
    changeRoundTL(round, oldHost, newHost) {
      this.$emit("changesMade");
      const arrayIndex = round.teamLeads.findIndex(
        el => el.host._id === oldHost._id
      );

      round.available.push(oldHost);
      if (newHost === "") {
        if (!this.excludedHosts.some(hostObj => hostObj === oldHost))
          this.$emit("excludedAdd", oldHost);
        return round.teamLeads.splice(arrayIndex, 1);
      }

      round.teamLeads.splice(arrayIndex, 1, {
        host: newHost,
        lostHosting: false,
        ready: false
      });
    },
    addTLToRound(round, hostAdded) {
      this.$emit("changesMade");
      round.teamLeads.push({
        host: hostAdded,
        ready: false,
        lostHosting: false
      });
      round.available = round.available.filter(host => host !== hostAdded);
      this.$emit("excludedRemove", hostAdded);
    }
  }
};
</script>