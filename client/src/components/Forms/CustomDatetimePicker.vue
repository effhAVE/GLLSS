<template>
  <v-datetime-picker
    :loading="loading"
    :label="label"
    v-model="model"
    color="secondary"
    :textFieldProps="{ color: 'accent', 'prepend-icon': icon, rules: rules }"
    :datePickerProps="{
      color: 'accent',
      'header-color': 'secondary',
      'first-day-of-week': 1
    }"
    :timePickerProps="{ color: 'accent', 'header-color': 'secondary' }"
    :tabsProps="{ 'active-class': 'accent--text', 'slider-color': 'accent' }"
    class="accent--text"
    @input="onInput"
    ref="picker"
  >
    <template v-slot:dateIcon>
      <v-icon>mdi-calendar</v-icon>
    </template>
    <template v-slot:timeIcon>
      <v-icon>mdi-clock</v-icon>
    </template>
    <template v-slot:actions>
      <v-btn color="grey lighten-1" text @click.native="$refs.picker.clearHandler">Clear</v-btn>
      <v-btn color="accent" text @click="okHandler">Save</v-btn>
    </template>
  </v-datetime-picker>
</template>
<script>
export default {
  props: {
    icon: {
      type: String,
      default: "mdi-calendar"
    },
    label: {
      type: String
    },
    date: {
      type: [String, Date]
    },
    rules: Array
  },
  data() {
    return {
      model: this.date,
      loading: true
    };
  },
  methods: {
    onInput(value) {
      this.$emit("input", value);
    },
    okHandler() {}
  },
  mounted() {
    this.okHandler = this.$refs.picker.okHandler;
    this.loading = false;
  }
};
</script>