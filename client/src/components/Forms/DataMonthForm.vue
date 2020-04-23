<template>
  <v-form ref="form" v-model="valid">
    <v-menu
      ref="menu"
      v-model="menu"
      :close-on-content-click="false"
      :return-value.sync="date"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="date"
          label="Data month"
          prepend-icon="mdi-calendar"
          color="accent"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="date" type="month" no-title scrollable>
        <v-spacer></v-spacer>
        <v-btn text color="accent" @click="menu = false">Cancel</v-btn>
        <v-btn text color="accent" @click="$refs.menu.save(date)">Save</v-btn>
      </v-date-picker>
    </v-menu>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn
        color="accent black--text"
        class="mt-8"
        text
        @click="$emit('submit', date)"
        :disabled="!valid"
      >
        Save
      </v-btn>
    </v-row>
  </v-form>
</template>
<script>
export default {
  data() {
    return {
      menu: false,
      date: this.$moment()
        .add(1, "months")
        .format("YYYY-MM"),
      valid: true
    };
  }
};
</script>