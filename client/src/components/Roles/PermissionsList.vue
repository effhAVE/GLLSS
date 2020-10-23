<template>
  <div>
    <v-card-text v-for="(permissionsGroup, groupName) in permissions" :key="groupName" class="pa-0">
      <v-container fluid class="py-0">
        <div v-for="(permissionsSubcategory, categoryName) in permissionsGroup" :key="categoryName" class="mb-6">
          <p class="subtitle accent--text ma-0">
            {{ categoryName.toUpperCase() }}
            <v-spacer></v-spacer>
          </p>
          <v-row>
            <v-col v-for="permission in permissionsSubcategory" cols="3" :key="permission.value" class="py-0 d-flex align-center">
              <v-checkbox
                v-model="selectedPermissions"
                :label="permission.name"
                color="accent"
                class="mt-2"
                :hint="permission.description"
                persistent-hint
                :value="permission.value"
                @change="$emit('update:rolePermissions', selectedPermissions)"
              ></v-checkbox>
              <v-menu bottom left offset-y :close-on-content-click="false" open-on-focus open-on-hover v-if="permission.props">
                <template v-slot:activator="{ on }">
                  <v-btn icon color="accent" v-on="on" :class="{ 'visually-hidden': !selectedPermissions.includes(permission.value) }">
                    <v-icon>mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <div class="text-center">Properties</div>
                  <v-form>
                    <v-list-item v-for="(prop, index) in permission.props" :key="index">
                      <v-checkbox
                        v-model="selectedPermissions"
                        :label="prop.name"
                        :value="prop.value"
                        @change="$emit('update:rolePermissions', selectedPermissions)"
                        color="accent"
                      ></v-checkbox>
                    </v-list-item>
                  </v-form>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-card-text>
  </div>
</template>
<script>
export default {
  props: {
    rolePermissions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      permissions: null,
      selectedPermissions: this.rolePermissions
    };
  },
  mounted() {
    this.$http.get(`${this.APIURL}/collections/permissions`).then(response => {
      this.permissions = response.data;
    });
  }
};
</script>