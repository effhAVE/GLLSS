<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Roles
      <v-spacer></v-spacer>
    </v-card-title>
    <v-tabs vertical background-color="transparent" color="accent" v-model="tab">
      <v-tab> <v-icon left> mdi-plus </v-icon> <span class="grey--text">New role</span> </v-tab>
      <v-tab v-for="(role, index) in roles" :key="index">
        <span :class="{ 'grey--text': role.color === 'transparent' }" :style="{ color: role.color }">{{ role.name }}</span>
      </v-tab>

      <v-tabs-items v-model="tab" vertical>
        <v-tab-item>
          <RoleForm @submit="createRole($event)" />
        </v-tab-item>
        <v-tab-item v-for="(role, index) in roles" :key="index">
          <RoleForm :role="role" @submit="updateRole($event)" @delete="deleteRole" />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </v-card>
</template>
<script>
import RoleForm from "../../components/Forms/RoleForm";
export default {
  components: {
    RoleForm
  },
  data() {
    return {
      roles: [],
      tab: 1
    };
  },
  computed: {
    selectedRole() {
      return this.roles[this.tab - 1];
    }
  },
  mounted() {
    this.$http.get(`${this.APIURL}/roles`).then(response => {
      this.roles = response.data;
    });
  },
  methods: {
    createRole(roles) {
      this.$http.post(`${this.APIURL}/roles`, roles).then(response => {
        if (response.status >= 400) {
          throw new Error(response.data);
        }
        this.roles.push(response.data);
        this.$store.commit("snackbarMessage", {
          type: "success",
          message: "Role created."
        });
      });
    },
    updateRole(role) {
      this.$http.put(`${this.APIURL}/roles/${role._id}`, role).then(response => {
        if (response.status >= 400) {
          throw new Error(response.data);
        }

        let roleIndex = this.roles.findIndex(r => r._id === response.data._id);
        if (roleIndex >= 0) this.$set(this.roles, roleIndex, response.data);
        this.$store.commit("snackbarMessage", {
          type: "success",
          message: "Role updated."
        });
      });
    },
    deleteRole(role) {
      this.$http.delete(`${this.APIURL}/roles/${role._id}`).then(response => {
        if (response.status >= 400) {
          throw new Error(response.data);
        }

        let roleIndex = this.roles.findIndex(r => r._id === response.data._id);
        if (roleIndex >= 0) this.roles.splice(roleIndex, 1);
        this.$store.commit("snackbarMessage", {
          type: "success",
          message: "Role removed."
        });
      });
    }
  }
};
</script>
<style lang="scss">
.color-picker {
  width: 70px;
  height: 30px;
  cursor: pointer;
  border-radius: 4px;
  border: thin solid rgba(255, 255, 255, 0.12);
}
</style>