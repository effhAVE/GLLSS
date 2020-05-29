<template>
  <v-form ref="form" style="min-width: 500px">
    <v-text-field v-model="draft.login" color="accent" label="Login" prepend-icon="mdi-account" required></v-text-field>
    <v-text-field v-model="draft.password" color="accent" label="Password" prepend-icon="mdi-lock" required></v-text-field>
    <div v-if="account">
      <v-select
        :items="presets"
        v-model="draft.presets"
        item-value="name"
        background-color="transparent"
        color="accent"
        flat
        prepend-icon="mdi-arrow-down-box"
        label="Add a preset"
        multiple
        item-color="accent"
      >
      </v-select>
      <v-textarea color="accent" label="Notes" :value="account.notes" v-model="draft.notes"></v-textarea>
    </div>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('submit', draft)">
        Save
      </v-btn>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('cancel')" v-if="account">
        Cancel
      </v-btn>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: {
    account: Object,
    presets: Array
  },
  data() {
    return {
      draft: {
        login: "",
        password: ""
      }
    };
  },
  mounted() {
    if (this.account) {
      this.draft = Object.assign({}, this.account);
    }
  }
};
</script>