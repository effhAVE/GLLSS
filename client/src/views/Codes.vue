<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Apex Codes
      <v-spacer></v-spacer>
    </v-card-title>
    <v-data-table
      class="table-background not-editable"
      :items="codes"
      :headers="headers"
      no-data-text="No codes"
      item-key="_id"
      hide-default-footer
      disable-pagination
      disable-sort
      dense
    >
      <template v-slot:item.expiration="{ value }">
        {{ $moment(value).format("DD MMMM YYYY HH:mm") }}
      </template>
      <template v-slot:item.statsToken="{ value }">
        <a :href="`https://apex.seatlon.eu/matches/${value}`" target="_blank">{{ value }}</a>
      </template>
      <template v-slot:item.adminToken="{ item }">
        <v-btn v-if="displayAdminTokenButton(item) && !item.adminToken" text color="accent" small @click="getAdminToken(item)">Display</v-btn>
        <span v-else-if="item.adminToken">{{ item.adminToken }}</span>
      </template>
      <template v-slot:item.assignedUser1="{ item, value }">
        <div class="d-flex justify-space-between align-center px-1">
          <span v-if="value" :class="value._id === $store.state.user._id ? 'accent--text font-weight-black' : ''">{{ value.nickname }}</span>
          <span v-else class="grey--text caption">none</span>
          <v-menu bottom offset-y max-height="300px" v-if="$store.getters.hasPermission('codesProps.assignedUser')">
            <template v-slot:activator="{ on }">
              <v-btn small icon v-on="on">
                <v-icon small> mdi-account-details </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="assignUserToCode(item, '', 1)">
                <v-list-item-title class="warning--text">None</v-list-item-title>
              </v-list-item>
              <v-list-item v-for="(user, i) in usersList" :key="i" @click="assignUserToCode(item, user, 1)">
                <v-list-item-title>{{ user.nickname }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      <template v-slot:item.assignedUser2="{ item, value }">
        <div class="d-flex justify-space-between align-center px-1">
          <span v-if="value" :class="value._id === $store.state.user._id ? 'accent--text font-weight-black' : ''">{{ value.nickname }}</span>
          <span v-else class="grey--text caption">none</span>
          <v-menu bottom offset-y max-height="300px" v-if="$store.getters.hasPermission('codesProps.assignedUser')">
            <template v-slot:activator="{ on }">
              <v-btn small icon v-on="on">
                <v-icon small> mdi-account-details </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="assignUserToCode(item, '', 2)">
                <v-list-item-title class="warning--text">None</v-list-item-title>
              </v-list-item>
              <v-list-item v-for="(user, i) in usersList" :key="i" @click="assignUserToCode(item, user, 2)">
                <v-list-item-title>{{ user.nickname }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-dialog v-model="item.menu" persistent max-width="600px" v-if="$store.getters.hasPermission('codes.update')">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on">
                <v-icon small> mdi-pencil </v-icon>
              </v-btn>
            </template>
            <v-card class="primary">
              <v-card-text>
                <v-container>
                  <CodeForm
                    :code="item"
                    @cancel="item.menu = false"
                    @submit="
                      editCode($event);
                      item.menu = false;
                    "
                  />
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-dialog v-model="item.deleteModal" max-width="500px" overlay-color="primary">
            <template v-slot:activator="{ on }">
              <v-btn icon color="error" v-if="$store.getters.hasPermission('codes.delete')" v-on="on">
                <v-icon small> mdi-minus </v-icon>
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="headline">Are you sure?</v-card-title>
              <v-card-text>You're about to delete the code from the database. This action cannot be undone.</v-card-text>
              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="deleteCode(item)"> Yes </v-btn>
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
import CodeForm from "../components/Forms/CodeForm";
export default {
  components: {
    CodeForm
  },
  data() {
    return {
      codes: [],
      usersList: [],
      headers: [
        {
          text: "Expiration",
          value: "expiration"
        },
        {
          text: "Stats token",
          value: "statsToken"
        },
        {
          text: "Admin token",
          value: "adminToken"
        },
        {
          text: "Player token",
          value: "playerToken"
        },
        {
          text: "Assigned user",
          value: "assignedUser1"
        },
        {
          text: "Assigned user",
          value: "assignedUser2"
        },
        {
          text: "Notes",
          value: "notes",
          width: "30%"
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
    this.getCodes();
    if (this.$store.getters.hasPermission("codesProps.assignedUser")) {
      this.$http.get(`${this.APIURL}/users/list`).then(response => {
        this.usersList = response.data;
      });
    }
  },
  methods: {
    getCodes() {
      this.$http.get(`${this.APIURL}/codes/`).then(response => {
        this.codes = response.data;
      });
    },
    displayAdminTokenButton(code) {
      return (
        (code.assignedUser1 && code.assignedUser1._id === this.$store.state.user._id) ||
        (code.assignedUser2 && code.assignedUser2._id === this.$store.state.user._id) ||
        this.$store.getters.hasPermission("codes.viewAnyAdminToken")
      );
    },
    getAdminToken(code) {
      this.$http
        .get(`${this.APIURL}/codes/${code._id}/admintoken`)
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.$set(code, "adminToken", response.data);
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error || "Error while retrieving admin token.",
            type: "error"
          });
        });
    },
    assignUserToCode(code, user, slot) {
      this.$http
        .put(`${this.APIURL}/codes/${code._id}/assign?slot=${slot}`, { user })
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          code[`assignedUser${slot}`] = response.data[`assignedUser${slot}`];
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: error || "Error while saving",
            type: "error"
          });
        });
    },
    editCode(code) {
      this.$http
        .put(`${this.APIURL}/codes/${code._id}/`, code)
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.$router.go();
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Code edited successfully!"
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error || "Error while editing."
          });
        });
    },
    deleteCode(code) {
      this.$http.delete(`${this.APIURL}/codes/${code._id}/`).then(response => {
        this.$router.go();
        this.$store.commit("snackbarMessage", {
          message: "Code deleted!",
          type: "success"
        });
      });
    }
  }
};
</script>