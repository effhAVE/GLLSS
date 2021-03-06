<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      PUBG Accounts
      <v-spacer></v-spacer>
      <v-switch v-model="getOnlyMine" label="Show accessible only" @change="getAccounts" color="accent"></v-switch>
      <v-btn text color="accent" @click="getAccounts">Refresh the accounts</v-btn>
    </v-card-title>
    <v-data-table
      class="table-background not-editable"
      :items="accounts"
      :headers="headers"
      no-data-text="No accounts"
      item-key="_id"
      hide-default-footer
      disable-pagination
      disable-sort
      dense
    >
      <template v-slot:item.haveAccess="{ item }">
        <v-simple-checkbox
          color="accent"
          readonly
          :value="item.haveAccess.includes($store.state.user._id)"
          :ripple="false"
          @input="setAccess(item, $event)"
        ></v-simple-checkbox>
      </template>
      <template v-slot:item.claimedBy="{ item }">
        <div class="d-flex align-center">
          <span v-if="item.locked" class="error--text px-3"><strong>LOCKED</strong></span>
          <v-btn small text color="success" v-else-if="!item.claimedBy" @click="claimAccount(item, $store.state.user, false)">Claim</v-btn>
          <v-btn
            small
            text
            color="warning"
            v-else-if="$store.state.user._id === item.claimedBy._id"
            @click="claimAccount(item, $store.state.user, true)"
            >Unclaim</v-btn
          >
          <span v-else class="px-3 subtitle-2">{{ item.claimedBy.nickname }}</span>
          <v-menu bottom offset-y max-height="300px" v-if="$store.getters.hasPermission('accountsProps.claimedBy') && !item.locked">
            <template v-slot:activator="{ on }">
              <v-btn small icon v-on="on">
                <v-icon small> mdi-account-details </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="claimAccount(item, item.claimedBy, true)">
                <v-list-item-title class="warning--text">Unclaim</v-list-item-title>
              </v-list-item>
              <v-list-item v-for="(user, i) in usersList" :key="i" @click="claimAccount(item, user, false)">
                <v-list-item-title>{{ user.nickname }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      <template v-slot:item.claimExpiration="{ item }">
        <span v-if="item.claimExpiration">{{ $moment(item.claimExpiration).from($store.state.now) }}</span>
      </template>
      <template v-slot:item.presets="{ item }">
        <v-tooltip bottom color="secondary" v-for="preset in item.presets" :key="preset._id">
          <template v-slot:activator="{ on }">
            <span v-on="on">{{ preset.name }}, </span>
          </template>
          <p>Created by: {{ preset.createdBy.nickname }}</p>
          <p>Creation time: {{ preset.createdAt | moment("YYYY-MM-DD HH:mm") }}</p>
        </v-tooltip>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-dialog v-model="item.menu" persistent max-width="600px" v-if="$store.getters.hasPermission('accounts.update')">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on">
                <v-icon small> mdi-pencil </v-icon>
              </v-btn>
            </template>
            <v-card class="primary">
              <v-card-text>
                <v-container>
                  <AccountForm
                    :account="item"
                    :presets="presets"
                    @cancel="item.menu = false"
                    @submit="
                      editAccount($event);
                      item.menu = false;
                    "
                  />
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-dialog v-model="item.lockModal" max-width="500px" overlay-color="primary" v-if="$store.getters.hasPermission('accountsProps.locked')">
            <template v-slot:activator="{ on }">
              <v-btn icon :color="item.locked ? 'success' : 'error'" v-on="on">
                <v-icon small v-if="!item.locked"> mdi-lock </v-icon>
                <v-icon small v-else> mdi-lock-open </v-icon>
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="headline">{{ item.locked ? "Unlock" : "Lock" }} the account</v-card-title>
              <v-card-text>This action will unclaim the account for any user.</v-card-text>
              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="lockAccount(item)"> Yes </v-btn>
                <v-btn color="success" text @click="item.lockModal = false"> Cancel </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="item.deleteModal" max-width="500px" overlay-color="primary">
            <template v-slot:activator="{ on }">
              <v-btn icon color="error" v-if="$store.getters.hasPermission('accounts.delete')" v-on="on">
                <v-icon small> mdi-minus </v-icon>
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="headline">Are you sure?</v-card-title>
              <v-card-text>You're about to delete {{ item.login }} from the database. This action cannot be undone.</v-card-text>
              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="deleteAccount(item)"> Yes </v-btn>
                <v-btn color="success" text @click="item.deleteModal = false"> Cancel </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import AccountForm from "../components/Forms/AccountForm";
export default {
  components: {
    AccountForm
  },
  data() {
    return {
      accounts: [],
      presets: [],
      usersList: [],
      getOnlyMine: this.$store.state.preferences.displayOnlyMyAccounts || false,
      headers: [
        {
          text: "Access",
          value: "haveAccess",
          width: 25
        },
        {
          text: "Login",
          value: "login",
          width: 100
        },
        {
          text: "Password",
          value: "password",
          width: 100
        },
        {
          text: "Claimed by",
          value: "claimedBy",
          width: 150
        },
        {
          text: "Claim expiration",
          value: "claimExpiration",
          width: 125
        },
        {
          text: "Presets",
          value: "presets",
          width: "25%"
        },
        {
          text: "Notes",
          value: "notes",
          width: 200
        },
        {
          text: "",
          value: "actions",
          width: 50
        }
      ]
    };
  },
  created() {
    this.getAccounts();

    this.$http.get(`${this.APIURL}/collections/presets`).then(response => {
      this.presets = response.data;
    });

    if (this.$store.getters.hasPermission("accountsProps.claimedBy")) {
      this.$http.get(`${this.APIURL}/users/list`).then(response => {
        this.usersList = response.data.filter(user => user._id !== this.$store.state.user._id);
      });
    }
  },
  methods: {
    getAccounts() {
      this.$http.get(`${this.APIURL}/accounts/?my=${this.getOnlyMine}`).then(response => {
        this.accounts = response.data;
      });
    },
    setAccess(account, value) {
      this.$http.put(`${this.APIURL}/accounts/${account._id}/access`, { value: value }).then(response => {
        account.haveAccess = response.data.haveAccess;
      });
    },
    lockAccount(account) {
      account.lockModal = false;
      this.$http.put(`${this.APIURL}/accounts/${account._id}/lock`).then(response => {
        const { locked, claimedBy, claimExpiration } = response.data;
        account.locked = locked;
        account.claimedBy = claimedBy;
        account.claimExpiration = claimExpiration;
      });
    },
    editAccount(account) {
      this.$http
        .put(`${this.APIURL}/accounts/${account._id}/`, account)
        .then(response => {
          this.$router.go();
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Account edited successfully!"
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: "Error while editing."
          });
        });
    },
    deleteAccount(account) {
      this.$http.delete(`${this.APIURL}/accounts/${account._id}/`).then(response => {
        this.$router.go();
        this.$store.commit("snackbarMessage", {
          message: "Account deleted!",
          type: "success"
        });
      });
    },
    claimAccount(account, user, isCancel) {
      this.$http
        .put(`${this.APIURL}/accounts/${account._id}/claim`, { cancel: isCancel, user: user })
        .then(response => {
          if (response.status >= 400) {
            throw new Error(response.data);
          } else {
            account.claimedBy = response.data.claimedBy;
            account.claimExpiration = response.data.claimExpiration;
          }
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error
          });
        });
    },
    addPreset(account) {
      this.$http.post(`${this.APIURL}/accounts/${account._id}/presets`, { name: name }).then(response => {
        account.presets = response.data.presets;
      });
    }
  }
};
</script>