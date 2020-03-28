<template>
  <v-simple-table class="table-background mt-8 text-center table-simple">
    <template v-slot:default>
      <tbody>
        <tr class="not-editable">
          <th>Best of</th>
          <td>{{ round.bestOf }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  props: {
    round: Object
  }
};
</script>