<template>
  <v-simple-table class="table-background table-simple not-editable">
    <template v-slot:default>
      <tbody>
        <tr>
          <th>Name</th>
          <td>{{ tournament.name }}</td>
        </tr>
        <tr>
          <th>ID</th>
          <td>{{ tournament._id }}</td>
        </tr>
        <tr>
          <th>Series ID</th>
          <td>
            <router-link v-if="tournament.series" :to="`/series/${tournament.series}`">{{ tournament.series }}</router-link>
            <span v-else>null</span>
          </td>
        </tr>
        <tr>
          <th>Admin page URL</th>
          <td>
            <a :href="tournament.gllURL" v-if="tournament.gllURL">
              {{ tournament.gllURL }}
            </a>
            <span v-else>null</span>
          </td>
        </tr>
        <tr>
          <th>Game</th>
          <td>{{ tournament.game }}</td>
        </tr>
        <tr>
          <th>Region</th>
          <td>{{ tournament.region }}</td>
        </tr>
        <tr>
          <th>Start date</th>
          <td>
            {{ tournament.startDate | moment("MMMM DD, YYYY HH:mm") }}
          </td>
        </tr>
        <tr>
          <th>End date</th>
          <td>{{ tournament.endDate | moment("MMMM DD, YYYY HH:mm") }}</td>
        </tr>
        <tr>
          <th>Tournament cost</th>
          <td>Team leaders: {{ cost.TL }} SEK. Hosts: {{ cost.host }} SEK. Total: {{ cost.TL + cost.host }} SEK</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  props: {
    tournament: Object,
    cost: Object
  }
};
</script>


<style lang="scss">
.table-background.table-simple {
  border: thin solid rgba(255, 255, 255, 0.12);
  th + th {
    border-left: thin solid rgba(255, 255, 255, 0.12);
  }
  th + td {
    border-left: thin solid rgba(255, 255, 255, 0.12);
  }
  td + td {
    border-left: thin solid rgba(255, 255, 255, 0.12);
  }
  tfoot {
    th,
    td {
      border-top: thin solid rgba(255, 255, 255, 0.12);
    }
  }
  thead {
    th,
    td {
      border-bottom: thin solid rgba(255, 255, 255, 0.12);
    }
  }
}
</style>
