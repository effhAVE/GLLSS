<template>
  <v-card color="transparent" width="25%" raised>
    <v-snackbar
      v-model="changesMade"
      color="secondary border--accent"
      bottom
      right
      multi-line
      :timeout="0"
    >
      Do you want to save the changes?
      <v-btn text color="accent" @click="saveRound">
        Save
      </v-btn>
    </v-snackbar>
    <div class="secondary">
      <v-card-title>
        {{ round.name }}
        <v-spacer></v-spacer>
        <v-dialog v-model="editRoundModal" persistent max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn icon v-if="user.roles.includes('admin')" v-on="on">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <v-card class="primary">
            <v-card-text>
              <v-container>
                <RoundForm
                  :round="round"
                  @cancel="editRoundModal = false"
                  @submit="saveRound"
                />
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-btn icon>
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        start: {{ round.startDate | moment("LLL") }} <br />
        end: {{ round.endDate | moment("LLL") }}
      </v-card-subtitle>
    </div>
    <v-card-text>
      <v-data-table
        :headers="headerHosts"
        :disable-pagination="true"
        :items="round.hosts"
        disable-sort
        class="table-background table-shrinked overflow-hidden"
        :class="{ 'not-editable': !user.roles.includes('teamleader') }"
        no-data-text="No hosts set."
        hide-default-footer
      >
        <template v-slot:item.host="{ item }">
          <v-menu bottom left offset-y>
            <template v-slot:activator="{ on }">
              <div class="px-4" v-on="on">
                {{ item.host.nickname }}
                <div class="ml-auto">
                  <v-btn
                    v-if="!item.ready && item.host._id === user._id"
                    icon
                    class="ml-auto"
                    @click.stop="onReady(item)"
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
            <v-list v-if="user.roles.includes('teamleader')">
              <v-list-item
                v-for="(host, i) in [...noneSelect, ...round.available]"
                :key="i"
                @click="changeRoundHost(round, item.host, host)"
              >
                <v-list-item-title>{{ host.nickname }}</v-list-item-title>
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
        :disable-pagination="true"
        :items="round.teamLeads"
        disable-sort
        class="table-background table-shrinked overflow-hidden mt-8"
        :class="{ 'not-editable': !user.roles.includes('teamleader') }"
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
            <tr :class="{ 'not-editable': !user.roles.includes('teamleader') }">
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
import RoundForm from "./Forms/RoundForm";

export default {
  components: {
    RoundForm
  },
  props: {
    round: {
      type: Object,
      required: true
    },
    tournamentID: {
      type: String,
      required: true
    },
    user: Object
  },
  data() {
    return {
      noneSelect: ["-"],
      changesMade: false,
      editRoundModal: false,
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
    addHostToRound(round, hostAdded) {
      // push to database instead
      this.changesMade = true;
      round.hosts.push({ host: hostAdded, ready: false, lostHosting: false });
      round.available = round.available.filter(host => host !== hostAdded);
    },
    changeRoundHost(round, oldHost, newHost) {
      // db call instead
      this.changesMade = true;
      const arrayIndex = round.hosts.findIndex(
        el => el.host._id === oldHost._id
      );

      if (newHost === this.noneSelect[0]) {
        return round.hosts.splice(arrayIndex, 1);
      }

      round.hosts.splice(arrayIndex, 1, {
        host: newHost,
        lostHosting: false,
        ready: false
      });
    },
    saveRound() {
      this.changesMade = false;
      this.editRoundModal = false;
      const APIURL = process.env.VUE_APP_APIURL;

      this.$http
        .put(
          `${APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}`,
          this.round
        )
        .then(response => {
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Round updated."
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: "Error while updating."
          });
        });
    }
  }
};
</script>

<style lang="scss">
.table-shrinked {
  td {
    padding: 0;
    div:not(.v-menu) {
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