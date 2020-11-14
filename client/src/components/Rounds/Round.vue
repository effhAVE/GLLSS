<template>
  <v-card color="transparent" width="350px" raised>
    <div :class="isPast ? 'secondary darken-4' : 'secondary'">
      <v-card-title>
        {{ round.name }}
        <v-spacer></v-spacer>
        <v-dialog v-model="editRoundModal" persistent max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn icon v-if="$store.getters.hasPermission('rounds.update')" v-on="on">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <v-card class="primary">
            <v-card-text>
              <v-container>
                <RoundForm :round="round" @cancel="editRoundModal = false" @submit="saveRound" />
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-dialog v-model="deleteRoundModal" persistent max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn icon v-if="$store.getters.hasPermission('rounds.delete')" v-on="on">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">Are you sure?</v-card-title>
            <v-card-text>You're about to delete {{ round.name }} from the database. This action cannot be undone.</v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="deleteRound()"> Yes </v-btn>
              <v-btn color="success" text @click="deleteRoundModal = false"> Cancel </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-title>
      <v-card-subtitle>
        Start: {{ round.startDate | moment("MMMM DD, YYYY HH:mm") }} <br />
        End: {{ round.endDate | moment("MMMM DD, YYYY HH:mm") }} <br />
        Preparation time: {{ round.prepTime }} minutes
      </v-card-subtitle>
    </div>
    <v-card-text>
      <HostsTable
        :round="round"
        :tableSettings="tableSettings"
        :usersAvailable="usersAvailableFiltered"
        :game="game"
        :isPast="isPast"
        @pastAvailabilityEdited="$emit('pastAvailabilityEdited', $event)"
        @changesMade="changesMade = true"
        @ready="onReady($event, 'host')"
        @userUpdate="changesMade = true"
        @excludedAdd="onExcludedAdd"
        @excludedRemove="onExcludedRemove"
        v-if="$store.getters.hasPermission('hosts.view')"
      />
      <TLTable
        :round="round"
        :tableSettings="tableSettings"
        :usersAvailable="usersAvailableFiltered"
        :isPast="isPast"
        @pastAvailabilityEdited="$emit('pastAvailabilityEdited', $event)"
        @changesMade="changesMade = true"
        @ready="onReady($event, 'TL')"
        @userUpdate="changesMade = true"
        @excludedAdd="onExcludedAdd"
        @excludedRemove="onExcludedRemove"
        v-if="$store.getters.hasPermission('teamLeads.view')"
      />
      <Details :round="round" />
    </v-card-text>
  </v-card>
</template>

<script>
import RoundForm from "../Forms/RoundForm";
import Details from "./Details";
import HostsTable from "./HostsTable";
import TLTable from "./TLTable";
export default {
  components: {
    RoundForm,
    Details,
    HostsTable,
    TLTable
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
    game: {
      type: String,
      required: true
    },
    usersAvailable: {
      type: Array
    },
    isPast: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableSettings: {
        disablePagination: true,
        "disable-sort": true,
        "hide-default-footer": true
      },
      excluded: [],
      editRoundModal: false,
      deleteRoundModal: false,
      changesMade: false
    };
  },
  computed: {
    usersAvailableFiltered() {
      return this.usersAvailable.filter(
        user =>
          !(
            this.round.hosts.some(hostObject => hostObject.host._id === user._id) ||
            this.round.teamLeads.some(TLObject => TLObject.host._id === user._id)
          )
      );
    }
  },
  methods: {
    onReady(host, source) {
      this.$http
        .post(`${this.APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}/ready`, { source })
        .then(response => {
          host.ready = true;
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error.response.data || "Error while updating."
          });
        });
    },
    onChange() {
      this.changesMade = false;
      this.$emit("roundChanged", {
        round: this.round,
        excluded: this.excluded
      });
    },
    saveRound(round) {
      this.editRoundModal = false;
      this.changesMade = false;

      this.$http
        .put(`${this.APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}`, { round: round, excluded: this.excluded })
        .then(response => {
          this.$router.go();
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Round updated."
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error.response.data || "Error while updating."
          });
        });
    },
    deleteRound() {
      this.deleteRoundModal = false;

      this.$http
        .delete(`${this.APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}`)
        .then(response => {
          this.$router.go();
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Round successfully deleted."
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: "Error while deleting."
          });
        });
    },
    onExcludedAdd(host) {
      this.excluded.push(host);
    },
    onExcludedRemove(host) {
      this.excluded = this.excluded.filter(hostObj => hostObj !== host);
    },
    onUserUpdate(user) {
      this.$http
        .put(`${this.APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}`, { round: this.round, excluded: this.excluded })
        .then(response => {
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Round updated."
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error.response.data || "Error while updating."
          });
        });
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
.table-shrinked {
  td {
    padding: 0;
    div:not(.v-menu):not(.oneline-text) {
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