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
        <v-dialog v-model="deleteRoundModal" persistent max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn icon v-if="user.roles.includes('admin')" v-on="on">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">Are you sure?</v-card-title>
            <v-card-text
              >You're about to delete {{ round.name }} from the database. This
              action cannot be undone.</v-card-text
            >
            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="deleteRound()">
                Yes
              </v-btn>
              <v-btn color="success" text @click="deleteRoundModal = false">
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-title>
      <v-card-subtitle>
        start: {{ round.startDate | moment("LLL") }} <br />
        end: {{ round.endDate | moment("LLL") }}
      </v-card-subtitle>
    </div>
    <v-card-text>
      <HostsTable
        :round="round"
        :user="user"
        :tableSettings="tableSettings"
        :usersAvailable="usersAvailable"
        @changesMade="changesMade = true"
        @ready="onReady($event, 'host')"
        @userUpdate="onUserUpdate"
        @excludedAdd="onExcludedAdd"
        @excludedRemove="onExcludedRemove"
      />
      <TLTable
        :round="round"
        :user="user"
        :tableSettings="tableSettings"
        :usersAvailable="usersAvailable"
        @changesMade="changesMade = true"
        @ready="onReady($event, 'TL')"
        @userUpdate="onUserUpdate"
        @excludedAdd="onExcludedAdd"
        @excludedRemove="onExcludedRemove"
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
    usersAvailable: {
      type: Array,
      default: () => []
    },
    user: Object
  },
  data() {
    return {
      tableSettings: {
        disablePagination: true,
        "disable-sort": true,
        "hide-default-footer": true
      },
      excluded: [],
      changesMade: false,
      editRoundModal: false,
      deleteRoundModal: false
    };
  },
  methods: {
    onReady(host, source) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .post(
          `${APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}/ready`,
          { source }
        )
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
    saveRound({ round }) {
      this.changesMade = false;
      this.editRoundModal = false;
      const APIURL = process.env.VUE_APP_APIURL;
      round = round || this.round;

      this.$http
        .put(
          `${APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}`,
          { round: round, excluded: this.excluded }
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
            message: error.response.data || "Error while updating."
          });
        });
    },
    deleteRound() {
      this.deleteRoundModal = false;
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .delete(
          `${APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}`
        )
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
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .put(
          `${APIURL}/tournaments/${this.tournamentID}/rounds/${this.round._id}`,
          { round: this.round, excluded: this.excluded }
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
            message: error.response.data || "Error while updating."
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