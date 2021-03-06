<template>
  <v-data-table
    :headers="headerTLs"
    :items="round.teamLeads"
    v-bind="tableSettings"
    class="mt-8 table-background table-shrinked overflow-hidden"
    :class="{ 'not-editable': !$store.getters.hasPermission('teamLeads.update') }"
    no-data-text="No team leads set."
  >
    <template v-slot:item.teamLeads="{ item }">
      <v-menu bottom left offset-y max-height="300px">
        <template v-slot:activator="{ on }">
          <div class="px-4" v-on="on">
            <v-btn icon color="error" @click.stop="changeRoundTL(round, item.host, '')" v-if="$store.getters.hasPermission('teamLeads.remove')">
              <v-icon>mdi-skull-crossbones</v-icon>
            </v-btn>
            <div class="oneline-text" style="max-width: 100px">
              <username :user="item.host" />
            </div>
            <div class="ml-auto">
              <v-btn
                v-if="!item.ready && !item.lostLeading && item.host._id === $store.state.user._id"
                icon
                class="ml-auto"
                @click.stop="$emit('ready', item)"
                :disabled="readyDisabled()"
              >
                <v-icon color="success">mdi-check</v-icon>
              </v-btn>
              <div v-if="+item.timeBalance" class="icon-size" :class="item.timeBalance > 0 ? 'success--text' : 'error--text'">
                <span v-if="item.timeBalance > 0">+</span>{{ item.timeBalance }}
              </div>
              <v-icon v-if="item.lostLeading" color="warning"> mdi-account-off </v-icon>
              <v-icon v-else-if="item.ready" color="success"> mdi-account-check </v-icon>
              <v-icon class="ml-auto" v-else color="error"> mdi-account-remove </v-icon>
              <v-menu
                bottom
                right
                offset-x
                v-model="item.menu"
                :close-on-content-click="false"
                v-if="$store.getters.hasPermission('teamLeads.update')"
              >
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <div class="text-center">{{ item.host.nickname }}</div>
                  <v-form>
                    <v-list-item>
                      <v-checkbox
                        v-model="item.ready"
                        label="Ready"
                        color="accent"
                        :disabled="!$store.getters.hasPermission('teamLeadsProps.ready')"
                      ></v-checkbox>
                    </v-list-item>
                    <v-list-item>
                      <v-checkbox
                        v-model="item.lostLeading"
                        label="Lost leading"
                        color="accent"
                        :disabled="!$store.getters.hasPermission('teamLeadsProps.lostLeading')"
                      ></v-checkbox>
                    </v-list-item>
                    <v-list-item>
                      <v-text-field
                        label="Time balance"
                        v-model="item.timeBalance"
                        type="number"
                        color="accent"
                        :disabled="!$store.getters.hasPermission('teamLeadsProps.balance')"
                      ></v-text-field>
                    </v-list-item>
                    <v-container>
                      <v-row>
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          class="mr-4"
                          color="accent"
                          @click="
                            item.menu = false;
                            $emit('userUpdate', item);
                          "
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
        <v-list v-if="$store.getters.hasPermission('teamLeads.add') && isPast">
          <v-list-item v-for="(host, i) in availableEdited" :key="i" @click="changeRoundTL(round, item.host, host)">
            <v-list-item-title>{{ host.nickname }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list v-else-if="$store.getters.hasPermission('teamLeads.add') && availableTLs.length">
          <v-list-item v-for="(host, i) in availableTLs" :key="i" @click="changeRoundTL(round, item.host, host)">
            <v-list-item-title>{{ host.nickname }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list v-else-if="$store.getters.hasPermission('teamLeads.add')">
          <v-list-item>
            <v-list-item-title>No teamleaders available.</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <template v-slot:body.append v-if="$store.getters.hasPermission('teamLeads.add')">
      <v-menu bottom left max-height="300px">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" color="success" width="100%">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <v-list v-if="isPast">
          <v-list-item v-for="(host, i) in availableEdited" :key="i" @click="addTLToRound(round, host)">
            <v-list-item-title>{{ host.nickname }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list v-else-if="availableTLs.length && !isPast">
          <v-list-item v-for="(host, i) in availableTLs" :key="i" @click="addTLToRound(round, host)">
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
</template>

<script>
export default {
  props: {
    round: Object,
    tableSettings: Object,
    usersAvailable: Array,
    isPast: Boolean
  },
  data() {
    return {
      headerTLs: [
        {
          text: "Team leads",
          value: "teamLeads",
          align: "center"
        }
      ],
      excludedHosts: [],
      availableEdited: [...this.usersAvailable]
    };
  },
  computed: {
    availableTLs() {
      return this.round.available.filter(host => host.roles.some(role => role.permissions.includes("hosting.canLead")));
    }
  },
  methods: {
    readyDisabled() {
      return (
        this.$moment(this.round.startDate).diff(this.$store.state.now, "minutes") > 90 ||
        this.$moment(this.round.startDate).diff(this.$store.state.now, "minutes") < 30
      );
    },
    changeRoundTL(round, oldHost, newHost) {
      this.$emit("changesMade");
      const arrayIndex = round.teamLeads.findIndex(el => el.host._id === oldHost._id);

      if (this.isPast) {
        this.availableEdited = this.availableEdited.filter(hostObj => hostObj !== newHost);
        this.availableEdited.push(oldHost);
        this.$emit("pastAvailabilityEdited", this.availableEdited);
      } else {
        round.available = round.available.filter(hostObj => hostObj !== newHost);
        round.available.push(oldHost);
      }

      if (!this.excludedHosts.some(hostObj => hostObj === oldHost)) this.$emit("excludedAdd", oldHost);
      if (newHost === "") {
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
      this.availableEdited = this.availableEdited.filter(host => host !== hostAdded);
      this.$emit("pastAvailabilityEdited", this.availableEdited);
      this.$emit("excludedRemove", hostAdded);
    }
  },
  watch: {
    usersAvailable(newValue) {
      this.availableEdited = this.usersAvailable.filter(user => !this.round.teamLeads.some(TLObject => TLObject.host.nickname === user.nickname));
    }
  }
};
</script>