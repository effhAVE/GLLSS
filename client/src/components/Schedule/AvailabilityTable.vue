<template>
  <v-card-text>
    <v-simple-table class="table-background not-editable availability-table" dense v-if="Object.values(list).length">
      <tbody>
        <tr>
          <td style="min-width: 150px" class="pa-0 has-border has-border-thick">
            <table class="text-right">
              <tr>
                <td>Day - Date</td>
              </tr>
              <tr>
                <td>Game</td>
              </tr>
              <tr>
                <td>
                  <div>Time - hours</div>
                  <div>Time - minutes</div>
                  <div class="d-flex justify-space-between"><span>Name</span> <span>\</span> <span>Best of</span></div>
                </td>
              </tr>
            </table>
          </td>

          <td v-for="(dayObject, dayName) in filteredGames" :key="dayName" class="pa-0 has-border has-border-thick">
            <table>
              <tr>
                <td :colspan="Object.values(dayObject).length">
                  <div>{{ $moment(dayName, "DD-MMMM-YYYY").format("ddd - DD.MM") }}</div>
                </td>
              </tr>

              <tr>
                <td v-for="(gameObject, gameName) in dayObject" :key="gameName" class="pa-0 has-border-left">
                  <table>
                    <tr>
                      <td :colspan="Object.values(gameObject).length">
                        <div
                          :style="{
                            maxWidth: `${(Object.values(gameObject).length * 60) / Object.values(dayObject).length}px`
                          }"
                          class="oneline-text mx-auto"
                        >
                          {{ gameName }}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td v-for="(round, i) in gameObject" :key="i" class="has-border-left round-border">
                        <div>{{ round.start.split(" ")[0] }}</div>
                        <div>{{ round.start.split(" ")[1] }}</div>
                        <div>B{{ round.bestOf }}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <template>
          <tr v-for="user in filteredUsers" :key="`AT${user._id}`" style="position: relative">
            <th class="fixed primary" :class="teamLeads.includes(user) ? 'blue--text' : user.isHosting ? '' : 'grey--text'">
              {{ user.nickname }}
            </th>
            <td v-for="(dayObject, dayName) in filteredGames" :key="dayName" class="has-border-left has-border-left-thick pa-0">
              <table style="table-layout: fixed; text-align: center">
                <tr>
                  <td v-for="(gameObject, gameName) in dayObject" :key="gameName" :colspan="gameObject.length" class="pa-0 has-border-left">
                    <table style="table-layout: fixed; text-align: center">
                      <tr>
                        <td v-for="(round, i) in gameObject" :key="i">
                          <span v-if="round.teamLeads.includes(user.nickname)" class="blue--text">L</span>
                          <span v-else-if="round.hosts.includes(user.nickname)" class="accent--text">H</span>
                          <span v-else-if="round.available.includes(user.nickname)">X</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </template>
      </tbody>
    </v-simple-table>
  </v-card-text>
</template>
<script>
export default {
  props: {
    availableList: {
      type: Object,
      required: true
    },
    showTeamleads: {
      type: Boolean,
      default: true
    },
    showHosts: {
      type: Boolean,
      default: true
    },
    selectedGames: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      teamLeads: [],
      hosts: [],
      list: this.availableList
    };
  },
  computed: {
    filteredGames() {
      const daysObject = {};
      for (let [day, games] of Object.entries(this.list)) {
        const filtered = Object.keys(games)
          .filter(game => this.selectedGames.includes(game))
          .reduce((object, game) => {
            object[game] = games[game];
            return object;
          }, {});
        daysObject[day] = filtered;
      }

      return daysObject;
    },
    filteredUsers() {
      const users = [];
      if (this.showTeamleads) {
        users.push(...this.teamLeads);
      }

      if (this.showHosts) {
        users.push(...this.hosts);
      }

      const availabilityUsers = [];

      users.forEach(user => {
        user.isHosting = false;
        for (let [day, games] of Object.entries(this.filteredGames)) {
          for (let game of Object.values(games)) {
            game.forEach(round => {
              const isHosting = round.hosts.some(host => host === user.nickname);
              const isLeading = round.teamLeads.some(host => host === user.nickname);
              if (isHosting) user.isHosting = true;
              if (isLeading) user.isLeading = true;
              if (!availabilityUsers.includes(user) && (round.available.includes(user.nickname) || isHosting || isLeading)) {
                availabilityUsers.push(user);
              }
            });
          }
        }
      });

      const filteredUsers = users.filter(user => availabilityUsers.includes(user));
      return filteredUsers;
    }
  },
  created() {
    this.$http.get(`${this.APIURL}/users/list`).then(response => {
      this.teamLeads = response.data.filter(user => user.roles.some(role => role.permissions.includes("hosting.canLead")));
      this.hosts = response.data.filter(user =>
        user.roles.some(role => !role.permissions.includes("hosting.canLead") && role.permissions.includes("hosting.canHost"))
      );
    });
  },
  watch: {
    availableList: {
      handler(list) {
        this.list = list;
      },
      deep: true
    }
  }
};
</script>