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
        <v-menu bottom left offset-y max-height="300px">
          <template v-slot:activator="{ on }">
            <div class="px-4" v-on="on">
              <v-btn
                icon
                color="error"
                @click.stop="changeRoundHost(round, item.host, '')"
                x-small
              >
                <v-icon>mdi-skull-crossbones</v-icon>
              </v-btn>
              {{ item.host.nickname }}
              <div class="ml-auto">
                <div
                  v-if="+item.timeBalance"
                  class="icon-size"
                  :class="
                    item.timeBalance > 0 ? 'success--text' : 'error--text'
                  "
                >
                  <span v-if="item.timeBalance > 0">+</span
                  >{{ item.timeBalance }}
                </div>
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
                <v-tooltip bottom v-else-if="item.ready" color="success">
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
                <v-menu bottom right offset-x :close-on-content-click="false">
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" small>
                      <v-icon small>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <div class="text-center">{{ item.host.nickname }}</div>
                    <v-form>
                      <v-list-item>
                        <v-checkbox
                          v-model="item.lostHosting"
                          label="Lost hosting"
                          color="accent"
                        ></v-checkbox>
                      </v-list-item>
                      <v-list-item>
                        <v-text-field
                          label="Round balance"
                          v-model="item.timeBalance"
                          type="number"
                          color="accent"
                        ></v-text-field>
                      </v-list-item>
                      <v-container>
                        <v-row>
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            class="mr-4"
                            color="accent"
                            @click.prevent="$emit('userUpdate', item)"
                          >
                            Save
                          </v-btn>
                        </v-row>
                      </v-container>
                    </v-form>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </template>
          <v-list v-if="round.available.length">
            <v-list-item
              v-for="(host, i) in round.available"
              :key="i"
              @click="changeRoundHost(round, item.host, host)"
            >
              <v-list-item-title>{{ host.nickname }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title>No hosts available.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:body.append>
        <v-menu bottom left max-height="300px">
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
        <v-menu bottom left offset-y max-height="300px">
          <template v-slot:activator="{ on }">
            <div class="px-4" v-on="on">
              <v-btn
                icon
                color="error"
                @click.stop="changeRoundTL(round, item.host, '')"
                x-small
              >
                <v-icon>mdi-skull-crossbones</v-icon>
              </v-btn>
              {{ item.host.nickname }}
              <div class="ml-auto">
                <div
                  v-if="+item.timeBalance"
                  class="icon-size"
                  :class="
                    item.timeBalance > 0 ? 'success--text' : 'error--text'
                  "
                >
                  <span v-if="item.timeBalance > 0">+</span
                  >{{ item.timeBalance }}
                </div>
                <v-tooltip bottom v-if="item.lostLeading" color="warning">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-icon color="warning" small>
                        mdi-account-off
                      </v-icon>
                    </span>
                  </template>
                  <span>Lost hosting</span>
                </v-tooltip>
                <v-tooltip bottom v-else-if="item.ready" color="success">
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
                <v-menu bottom right offset-x :close-on-content-click="false">
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" small>
                      <v-icon small>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <div class="text-center">{{ item.host.nickname }}</div>
                    <v-form>
                      <v-list-item>
                        <v-checkbox
                          v-model="item.lostLeading"
                          label="Lost leading"
                          color="accent"
                        ></v-checkbox>
                      </v-list-item>
                      <v-list-item>
                        <v-text-field
                          label="Time balance"
                          v-model="item.timeBalance"
                          type="number"
                          color="accent"
                        ></v-text-field>
                      </v-list-item>
                      <v-container>
                        <v-row>
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            class="mr-4"
                            color="accent"
                            @click.prevent="$emit('userUpdate', item)"
                          >
                            Save
                          </v-btn>
                        </v-row>
                      </v-container>
                    </v-form>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </template>
          <v-list v-if="availableTLs.length">
            <v-list-item
              v-for="(host, i) in availableTLs"
              :key="i"
              @click="changeRoundTL(round, item.host, host)"
            >
              <v-list-item-title>{{ host.nickname }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title>No teamleaders available.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:body.append>
        <v-menu bottom left max-height="300px">
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
      this.$emit("changesMade", {
        type: "hostChange",
        oldHost: oldHost,
        newHost: newHost,
        bestOf: round.bestOf
      });
      const arrayIndex = round.hosts.findIndex(
        el => el.host._id === oldHost._id
      );

      round.available = round.available.filter(hostObj => hostObj !== newHost);
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
      this.$emit("changesMade", {
        type: "hostAdd",
        host: hostAdded,
        bestOf: round.bestOf
      });
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