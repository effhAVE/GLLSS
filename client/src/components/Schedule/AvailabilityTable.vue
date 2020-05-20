<template>
  <v-card-text>
    <v-simple-table class="table-background not-editable availability-table" dense v-if="Object.values(availableList).length">
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

          <td v-for="(dayObject, dayName) in availableList" :key="dayName" class="pa-0 has-border has-border-thick">
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
        <tr v-for="user in [...teamLeads, ...hosts]" :key="`AT${user._id}`" style="position: relative">
          <th class="fixed primary" :class="teamLeads.includes(user) ? 'blue--text' : ''">
            {{ user.nickname }}
          </th>
          <td v-for="(dayObject, dayName) in availableList" :key="dayName" class="has-border-left has-border-left-thick pa-0">
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
    }
  },
  data() {
    return {
      teamLeads: [],
      hosts: []
    };
  },
  created() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/users/list`).then(response => {
      this.teamLeads = response.data.filter(user => user.roles.includes("teamleader") && user.nickname !== "hAVE");
      this.hosts = response.data.filter(user => !user.roles.includes("teamleader") || user.nickname === "hAVE");
    });
  }
};
</script>