<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      PUBG Accounts
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
    >
      <template v-slot:item.haveAccess="{ item }">
        <v-simple-checkbox
          color="accent"
          readonly
          :value="item.haveAccess.includes(user._id)"
          :ripple="false"
          @input="setAccess(item, $event)"
        ></v-simple-checkbox>
      </template>
      <template v-slot:item.claimedBy="{ item }">
        <div class="d-flex align-center">
          <span v-if="item.locked" class="error--text">LOCKED</span>
          <v-btn small text color="success" v-else-if="!item.claimedBy" @click="claimAccount(item, user, false)">Claim</v-btn>
          <v-btn small text color="warning" v-else-if="user._id === item.claimedBy._id" @click="claimAccount(item, user, true)">Unclaim</v-btn>
          <span v-else class="pa-3 subtitle-2">{{ item.claimedBy.nickname }}</span>
          <v-menu bottom offset-y max-height="300px" v-if="user.roles.includes('teamleader')">
            <template v-slot:activator="{ on }">
              <v-btn small icon v-on="on">
                <v-icon small>
                  mdi-account-details
                </v-icon>
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
        {{ item.presets.join(", ") }}
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-dialog v-model="item.menu" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on">
                <v-icon small>
                  mdi-pencil
                </v-icon>
              </v-btn>
            </template>
            <v-card class="primary">
              <v-card-text>
                <v-container>
                  <AccountForm :account="item" :presets="presets" @cancel="item.menu = false" />
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-btn icon :color="item.locked ? 'success' : 'error'" v-if="user.roles.includes('teamleader')" @click="lockAccount(item)">
            <v-icon small v-if="!item.locked">
              mdi-lock
            </v-icon>
            <v-icon small v-else>
              mdi-lock-open
            </v-icon>
          </v-btn>
          <v-btn icon color="error" v-if="user.roles.includes('admin')">
            <v-icon small>
              mdi-minus
            </v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import AccountForm from "../components/Forms/AccountForm";
export default {
  props: {
    user: Object
  },
  components: {
    AccountForm
  },
  data() {
    return {
      accounts: [],
      presets: [],
      usersList: [],
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
          width: 125
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
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/accounts/`).then(response => {
      this.accounts = response.data;
    });

    this.$http.get(`${APIURL}/collections/presets`).then(response => {
      this.presets = response.data;
    });

    this.$http.get(`${APIURL}/users/list`).then(response => {
      this.usersList = response.data.filter(user => user._id !== this.user._id);
    });
  },
  methods: {
    setAccess(account, value) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.put(`${APIURL}/accounts/${account._id}/access`, { value: value }).then(response => {
        account.haveAccess = response.data.haveAccess;
      });
    },
    lockAccount(account) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.put(`${APIURL}/accounts/${account._id}/lock`).then(response => {
        const { locked, claimedBy, claimExpiration } = response.data;
        account.locked = locked;
        account.claimedBy = claimedBy;
        account.claimExpiration = claimExpiration;
      });
    },
    claimAccount(account, user, isCancel) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.put(`${APIURL}/accounts/${account._id}/claim`, { cancel: isCancel, user: user }).then(response => {
        account.claimedBy = response.data.claimedBy;
        account.claimExpiration = response.data.claimExpiration;
      });
    },
    addPreset(account) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http.post(`${APIURL}/accounts/${account._id}/presets`, { name: name }).then(response => {
        account.presets = response.data.presets;
      });
    }
  }
};
</script>