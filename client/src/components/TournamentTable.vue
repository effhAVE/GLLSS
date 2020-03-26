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
          <td>{{ tournament.series || "null" }}</td>
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
          <td>{{ new Date(tournament.startDate).toLocaleString() }}</td>
        </tr>
        <tr>
          <th>End date</th>
          <td>{{ new Date(tournament.endDate).toLocaleString() }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  props: {
    tournament: Object
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
}
</style>
