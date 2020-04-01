<template>
  <v-datetime-picker
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
  >
    <template v-slot:dateIcon>
      <v-icon>mdi-calendar</v-icon>
    </template>
    <template v-slot:timeIcon>
      <v-icon>mdi-clock</v-icon>
    </template>
    <!-- <template v-slot:actions>
      <v-btn color="grey lighten-1" text @click.native="clearHandler"
        >Clear</v-btn
      >
      <v-btn color="accent" text @click="okHandler">Save</v-btn>
    </template> -->
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
      model: this.date
    };
  },
  methods: {
    onInput(value) {
      this.$emit("input", value);
    }
  }
};
</script>