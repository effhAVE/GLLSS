<template>
  <v-simple-table class="table-background table-simple not-editable user-table">
    <template v-slot:default>
      <tbody>
        <tr>
          <th>Nickname</th>
          <td>
            {{ user.nickname }}
          </td>
        </tr>
        <tr>
          <th>Name</th>
          <td>
            {{ user.details.name }}
          </td>
        </tr>
        <tr>
          <th>Country</th>
          <td>
            <p class="d-flex align-center ma-0" v-if="user.details.country">
              <country-flag :country="user.details.country.code" size="normal" /> <span class="ml-4">{{ user.details.country.name }} </span>
            </p>
          </td>
        </tr>
        <tr>
          <th>Languages</th>
          <td>
            <v-chip v-for="language in user.details.languages" :key="language.code" class="mr-2">
              {{ language.name }}
            </v-chip>
          </td>
        </tr>
        <tr>
          <th>Birthday</th>
          <td>
            <span v-if="user.details.birthday">{{ user.details.birthday | moment("MMMM DD, YYYY") }} ({{ user.age }} years old)</span>
          </td>
        </tr>
        <tr>
          <th>Gender</th>
          <td>{{ user.details.gender }}</td>
        </tr>
        <tr>
          <th>Roles</th>
          <td>
            <v-chip v-for="role in user.roles" :key="role._id" outlined :color="role.color === 'transparent' ? 'grey' : role.color" class="mr-2">
              {{ role.name }}
            </v-chip>
          </td>
        </tr>
        <tr v-if="user.email">
          <th>Email</th>
          <td>{{ user.email }}</td>
        </tr>
        <tr>
          <th>Registered</th>
          <td>{{ user.createdAt | moment("MMMM DD, YYYY HH:mm") }}</td>
        </tr>

        <tr>
          <th>Bio</th>
          <td>
            <pre class="body-2">{{ user.details.bio }}</pre>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import CountryFlag from "vue-country-flag";
export default {
  props: {
    user: Object
  },
  components: {
    CountryFlag
  }
};
</script>
<style lang="scss">
.user-table tr > th {
  width: 250px;
}
</style>
