<template>
  <v-card color="transparent" width="25%" raised>
    <div class="secondary">
      <v-card-title>
        {{ round.name }}
      </v-card-title>
      <v-card-subtitle>
        {{ new Date(round.startDate).toLocaleString() }} -
        {{ new Date(round.endDate).toLocaleString() }}
      </v-card-subtitle>
    </div>
    <v-card-text>
      <v-data-table
        :headers="headerHosts"
        :disable-pagination="true"
        :items="round.hosts"
        disable-sort
        class="table-background table-shrinked overflow-hidden"
        no-data-text="No hosts set."
        hide-default-footer
      >
        <template v-slot:item.host="{ item }">
          <div class="px-4">
            {{ item.host.nickname }}
            <div class="ml-auto">
              <v-btn
                v-if="!item.ready && item.host._id === user._id"
                icon
                class="ml-auto"
                @click="onReady(item)"
              >
                <v-icon color="success">mdi-check</v-icon>
              </v-btn>
              <v-icon class="ml-auto" v-if="item.ready" color="success">
                mdi-account-check
              </v-icon>
              <v-icon class="ml-auto" v-else color="error">
                mdi-account-remove
              </v-icon>
            </div>
          </div>
        </template>
        <template v-slot:body.append v-if="user.roles.includes('teamleader')">
          <v-menu bottom left>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" color="success" width="100%">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="(host, i) in round.available"
                :key="i"
                @click="addHostToRound(round, host)"
              >
                <v-list-item-title>{{ host.nickname }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <v-data-table
        :headers="headerTLs"
        :disable-pagination="true"
        :items="round.teamLeads"
        disable-sort
        class="table-background table-shrinked overflow-hidden mt-8"
        no-data-text="No team leads set."
        hide-default-footer
      >
        <template v-slot:item.teamLeads="{ item }">
          <div class="px-4">
            {{ item.teamLeads.nickname }}
            <div class="ml-auto">
              <v-btn
                v-if="!item.ready && item.teamLeads._id === user._id"
                icon
                class="ml-auto"
                @click="onReady(item)"
              >
                <v-icon color="success">mdi-check</v-icon>
              </v-btn>
              <v-icon v-if="item.ready" color="success">
                mdi-account-check
              </v-icon>
              <v-icon v-else color="error">
                mdi-account-remove
              </v-icon>
            </div>
          </div>
        </template>
        <template v-slot:body.append v-if="user.roles.includes('teamleader')">
          <v-btn width="100%" color="success">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-simple-table class="table-background mt-8 text-center table-simple">
        <template v-slot:default>
          <tbody>
            <tr>
              <th>Best of</th>
              <td>{{ round.bestOf }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    round: {
      type: Object,
      required: true
    },
    user: Object
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
      ]
    };
  },
  methods: {
    onReady(host) {
      // upload the round on backend
      host.ready = true;
    },
    addHostToRound(round, host) {
      // push to database instead
      round.hosts.push({ host: host, ready: false, lostHosting: false });
      round.available = round.available.filter(user => user !== host);
    }
  }
};
</script>

<style lang="scss">
.table-shrinked {
  td {
    padding: 0;
    div {
      height: inherit;
      display: flex;
      justify-content: center;
      align-items: center;
      &.accent:hover {
        background-color: var(--v-accent-base) !important;
      }
    }
  }
}
</style>