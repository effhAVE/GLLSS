<template>
  <v-simple-table class="table-background table-simple not-editable">
    <template v-slot:default>
      <tbody>
        <tr>
          <th>Name</th>
          <td>{{ series.name }}</td>
        </tr>
        <tr>
          <th>ID</th>
          <td>{{ series._id }}</td>
        </tr>
        <tr>
          <th>Game</th>
          <td>{{ series.game }}</td>
        </tr>
        <tr>
          <th>Region</th>
          <td>{{ series.region }}</td>
        </tr>
        <tr>
          <th>Reccurence</th>
          <td>{{ series.recurrence }}</td>
        </tr>
        <tr>
          <th>Start date</th>
          <td>
            {{ series.startDate | moment("LLL") }}
          </td>
        </tr>
        <tr>
          <th>End date</th>
          <td>{{ series.endDate | moment("LLL") }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  props: {
    series: Object
  }
};
</script>