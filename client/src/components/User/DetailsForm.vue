<template>
  <v-form ref="form" v-if="details" v-model="valid" @input="$emit('validation', $event)">
    <v-card-title>Account details</v-card-title>
    <v-text-field v-model="draft.name" @input="$emit('update:details', draft)" :rules="validations.name" color="accent" label="Name"></v-text-field>
    <v-menu
      ref="menu"
      v-model="birthdayPicker"
      @input="$emit('update:details', draft)"
      :close-on-content-click="false"
      :return-value.sync="draft.birthday"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field v-model="draft.birthday" :rules="validations.birthday" label="Birthday" color="accent" readonly v-on="on"></v-text-field>
      </template>
      <v-date-picker v-model="draft.birthday" no-title scrollable color="accent">
        <v-spacer></v-spacer>
        <v-btn text color="accent" @click="birthdayPicker = false">Cancel</v-btn>
        <v-btn text color="accent" @click="$refs.menu.save(draft.birthday)">Save</v-btn>
      </v-date-picker>
    </v-menu>
    <v-autocomplete
      v-model="draft.country"
      @input="$emit('update:details', draft)"
      :items="countries"
      dense
      label="Country"
      item-text="name"
      color="accent"
      return-object
    >
      <template v-slot:item="{ item }">
        <country-flag :country="item.code" size="normal" /> <span class="ml-4">{{ item.name }} </span>
      </template>
      <template v-slot:selection="{ item }">
        <country-flag :country="item.code" size="normal" /> <span class="ml-4">{{ item.name }} </span>
      </template>
    </v-autocomplete>
    <v-autocomplete
      v-model="draft.languages"
      @input="$emit('update:details', draft)"
      :items="languages"
      dense
      label="Languages spoken"
      item-text="name"
      color="accent"
      item-color="accent"
      return-object
      multiple
    >
    </v-autocomplete>
    <v-select
      @input="$emit('update:details', draft)"
      :items="[{ text: 'Not specified', value: '' }, 'Male', 'Female', 'Other']"
      label="Gender"
      color="accent"
      v-model="draft.gender"
    ></v-select>
    <v-textarea color="accent" label="Bio" v-model="draft.bio" @input="$emit('update:details', draft)"></v-textarea>
  </v-form>
</template>

<script>
import CountryFlag from "vue-country-flag";
import validations from "../../helpers/validations";

export default {
  components: {
    CountryFlag
  },
  props: {
    details: {
      type: Object
    }
  },
  data() {
    return {
      draft: null,
      countries: [],
      languages: [],
      birthdayPicker: false,
      validations: validations,
      valid: false
    };
  },
  created() {
    this.draft = Object.assign({}, this.details);
    this.$http.get(`${this.APIURL}/collections/countries`).then(response => {
      if (response.status >= 400) throw new Error(response.data);
      this.countries = response.data;
    });

    this.$http.get(`${this.APIURL}/collections/languages`).then(response => {
      if (response.status >= 400) throw new Error(response.data);
      this.languages = response.data;
    });
  }
};
</script>