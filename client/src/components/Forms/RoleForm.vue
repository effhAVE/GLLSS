<template>
  <v-form ref="form">
    <v-card-text>
      <v-row align="center" no-gutters>
        <p class="title accent--text flex-grow-1">Role name</p>
        <v-text-field
          v-model="draft.name"
          color="accent"
          required
          outlined
          dense
          :disabled="!$store.getters.hasPermission('rolesProps.name')"
        ></v-text-field>
      </v-row>
      <v-row align="center" no-gutters>
        <p class="title accent--text flex-grow-1">Role color</p>
        <v-switch
          v-model="draft.color"
          label="Transparent"
          color="accent"
          true-value="transparent"
          false-value="#FF0000"
          :disabled="!$store.getters.hasPermission('rolesProps.color')"
        ></v-switch>
        <v-menu offset-y :close-on-content-click="false" v-if="draft.color !== 'transparent'">
          <template v-slot:activator="{ on }">
            <div v-on="on" class="color-picker ml-4" :style="{ backgroundColor: draft.color }"></div>
          </template>
          <v-color-picker v-model="draft.color" class="mx-auto" :disabled="!$store.getters.hasPermission('rolesProps.color')"></v-color-picker>
        </v-menu>
      </v-row>
      <v-row align="center" no-gutters>
        <p class="title accent--text flex-grow-1">Importance</p>
        <v-text-field
          v-model="draft.importance"
          color="accent"
          class="flex-shrink-1 flex-grow-0"
          outlined
          dense
          type="number"
          min="1"
          max="5"
          :rules="[v => (v >= 1 && v <= 5) || 'Cannot be higher than 5 and lower than 1!']"
          hint="Specifies color used when having multiple roles"
          persistent-hint
          :disabled="!$store.getters.hasPermission('rolesProps.importance')"
        ></v-text-field>
      </v-row>
      <v-row align="center" no-gutters>
        <p class="title accent--text flex-grow-1">Editable</p>
        <v-switch
          v-model="draft.editable"
          :label="draft.editable ? 'Yes' : 'No'"
          color="accent"
          :disabled="!$store.getters.hasPermission('rolesProps.editable')"
        ></v-switch>
      </v-row>
      <p class="title accent--text">Permissions</p>
      <PermissionsList :rolePermissions.sync="draft.permissions" :disabled="!$store.getters.hasPermission('rolesProps.permissions')" />
    </v-card-text>

    <v-row>
      <v-spacer></v-spacer>
      <v-dialog v-model="deleteModal" persistent max-width="600px" v-if="role">
        <template v-slot:activator="{ on }">
          <v-btn color="error black--text" class="mt-8" text v-on="on" :disabled="!role.editable"> Delete </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text>You're about to delete {{ draft.name }} role from the database. This action cannot be undone.</v-card-text>
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="onDelete"> Yes </v-btn>
            <v-btn color="success" text @click="deleteModal = false"> Cancel </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-btn color="accent black--text" class="mt-8" text @click="onSubmit"> Save </v-btn>
    </v-row>
  </v-form>
</template>
<script>
import PermissionsList from "../Roles/PermissionsList";

export default {
  components: {
    PermissionsList
  },
  props: {
    role: {
      type: Object
    }
  },
  data() {
    return {
      deleteModal: false,
      draft: {
        name: "New role",
        color: "#FF0000",
        importance: 1,
        permissions: [],
        editable: true
      }
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.draft);
      if (!this.role) {
        this.draft = {
          name: "New role",
          color: "#FF0000",
          importance: 1,
          permissions: [],
          editable: true
        };
      }
    },
    onDelete() {
      this.deleteModal = false;
      this.$emit("delete", this.role);
    }
  },
  created() {
    if (this.role) {
      this.draft = Object.assign({}, this.role);
    }
  }
};
</script>