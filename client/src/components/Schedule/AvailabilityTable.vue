<template>
  <v-card-text>
    <v-simple-table
      class="table-background not-editable availability-table"
      dense
      v-if="availableList.length"
    >
      <tbody>
        <tr>
          <th style="min-width: 150px">User</th>
          <td
            v-for="tournamentObject in availableList"
            :key="tournamentObject.tournament"
          >
            <tr>
              <td :colspan="tournamentObject.rounds.length">
                <div style="min-width: 200px">
                  {{ tournamentObject.tournament }}
                </div>
              </td>
            </tr>
            <tr>
              <td
                v-for="round in tournamentObject.rounds"
                :key="round.roundName"
              >
                {{ round.roundName }}
              </td>
            </tr>
          </td>
        </tr>
        <tr
          v-for="user in usersList"
          :key="`AT${user._id}`"
          style="position: relative"
        >
          <th class="fixed">{{ user.nickname }}</th>
          <td
            v-for="tournamentObject in availableList"
            :key="tournamentObject.tournament"
            class="has-border"
          >
            <table style="table-layout: fixed; text-align: center">
              <tr>
                <td
                  v-for="round in tournamentObject.rounds"
                  :key="round.roundName"
                >
                  <span v-if="round.available.includes(user.nickname)">X</span>
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
      type: Array,
      required: true
    }
  },
  data() {
    return {
      usersList: []
    };
  },
  created() {
    const APIURL = process.env.VUE_APP_APIURL;
    this.$http.get(`${APIURL}/users/list`).then(response => {
      this.usersList = response.data;
    });
  }
};
</script>