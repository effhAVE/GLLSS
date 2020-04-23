<template>
  <v-data-table
    :headers="headerHosts"
    :items="round.hosts"
    v-bind="tableSettings"
    class="table-background table-shrinked overflow-hidden"
    :class="{ 'not-editable': !user.roles.includes('teamleader') }"
    no-data-text="No hosts set."
  >
    <template v-slot:item.host="{ item }">
      <v-menu bottom left offset-y>
        <template v-slot:activator="{ on }">
          <div class="px-4" v-on="on">
            <v-btn
              icon
              color="error"
              @click.stop="changeRoundHost(round, item.host, '')"
              v-if="user.roles.includes('teamleader')"
            >
              <v-icon>mdi-skull-crossbones</v-icon>
            </v-btn>
            {{ item.host.nickname }}
            <div class="ml-auto">
              <v-btn
                v-if="!item.ready && item.host._id === user._id"
                icon
                class="ml-auto"
                @click.stop="$emit('ready', item)"
                :disabled="readyDisabled()"
              >
                <v-icon color="success">mdi-check</v-icon>
              </v-btn>
              <div
                v-if="+item.timeBalance"
                class="icon-size"
                :class="item.timeBalance > 0 ? 'success--text' : 'error--text'"
              >
                <span v-if="item.timeBalance > 0">+</span>{{ item.timeBalance }}
              </div>
              <v-icon v-if="item.lostHosting" color="warning">
                mdi-account-off
              </v-icon>
              <v-icon v-else-if="item.ready" color="success">
                mdi-account-check
              </v-icon>
              <v-icon v-else color="error">
                mdi-account-remove
              </v-icon>
              <v-menu
                bottom
                right
                offset-x
                :close-on-content-click="false"
                v-if="user.roles.includes('teamleader')"
              >
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <div class="text-center">{{ item.host.nickname }}</div>
                  <v-form>
                    <v-list-item v-if="user.roles.includes('admin')">
                      <v-checkbox
                        v-model="item.ready"
                        label="Ready"
                        color="accent"
                      ></v-checkbox>
                    </v-list-item>
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
                          type="submit"
                          @click="$emit('userUpdate', item)"
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
        <v-list
          v-if="user.roles.includes('teamleader') && round.available.length"
        >
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
    <template v-slot:body.append v-if="user.roles.includes('teamleader')">
      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" color="success" width="100%">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>

        <v-list v-if="availableEdited.length">
          <v-list-item
            v-for="(host, i) in availableEdited"
            :key="i"
            @click="addHostToRound(round, host)"
          >
            <v-list-item-title>{{ host.nickname }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list v-else-if="round.available.length && !availableEdited.length">
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
</template>
<script>
export default {
  props: {
    round: Object,
    tableSettings: Object,
    user: Object,
    usersAvailable: Array
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
      excludedHosts: [],
      availableEdited: [...this.usersAvailable]
    };
  },
  methods: {
    readyDisabled() {
      return (
        this.$moment(this.round.startDate).diff(
          this.$store.state.now,
          "minutes"
        ) > 60 ||
        this.$moment(this.round.startDate).diff(
          this.$store.state.now,
          "minutes"
        ) < 30
      );
    },
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
      this.availableEdited = this.availableEdited.filter(
        host => host !== hostAdded
      );
      this.$emit("excludedRemove", hostAdded);
    }
  },
  watch: {
    usersAvailable(newValue) {
      this.availableEdited = this.usersAvailable.filter(
        user =>
          !this.round.hosts.some(
            hostObject => hostObject.host.nickname === user.nickname
          )
      );
    }
  }
};
</script>