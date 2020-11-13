<template>
  <v-form ref="form" style="min-width: 500px" v-if="details">
    <v-text-field v-model="details.name" color="accent" label="Name"></v-text-field>
    <v-menu
      ref="menu"
      v-model="birthdayPicker"
      :close-on-content-click="false"
      :return-value.sync="details.birthday"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field v-model="details.birthday" label="Birthday" color="accent" readonly v-on="on"></v-text-field>
      </template>
      <v-date-picker v-model="details.birthday" no-title scrollable color="accent">
        <v-spacer></v-spacer>
        <v-btn text color="accent" @click="birthdayPicker = false">Cancel</v-btn>
        <v-btn text color="accent" @click="$refs.menu.save(details.birthday)">Save</v-btn>
      </v-date-picker>
    </v-menu>
    <v-autocomplete v-model="details.country" :items="countries" dense label="Country" item-text="name" color="accent" return-object>
      <template v-slot:item="{ item }">
        <country-flag :country="item.code" size="normal" /> <span class="ml-4">{{ item.name }} </span>
      </template>
      <template v-slot:selection="{ item }">
        <country-flag :country="item.code" size="normal" /> <span class="ml-4">{{ item.name }} </span>
      </template>
    </v-autocomplete>
    <v-autocomplete
      v-model="details.languages"
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
      :items="[{ text: 'Not specified', value: '' }, 'Male', 'Female', 'Other']"
      label="Gender"
      color="accent"
      v-model="details.gender"
    ></v-select>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn color="accent black--text" class="mt-8" text @click="saveChanges"> Save </v-btn>
    </v-row>
  </v-form>
</template>

<script>
import CountryFlag from "vue-country-flag";
export default {
  components: {
    CountryFlag
  },
  data() {
    return {
      details: null,
      countries: [],
      languages: [],
      birthdayPicker: false
    };
  },
  mounted() {
    this.$http.get(`${this.APIURL}/users/me/details`).then(response => {
      this.details = response.data;
      if (this.details.birthday) {
        this.details.birthday = this.$moment(this.details.birthday).format("YYYY-MM-DD");
      }
    });

    this.$http.get(`${this.APIURL}/collections/countries`).then(response => {
      if (response.status >= 400) throw new Error(response.data);
      this.countries = response.data;
    });

    this.$http.get(`${this.APIURL}/collections/languages`).then(response => {
      if (response.status >= 400) throw new Error(response.data);
      this.languages = response.data;
    });
  },
  methods: {
    saveChanges() {
      this.$http
        .patch(`${this.APIURL}/users/me/details`, { details: this.details })
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.$router.push("/me");
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Changes saved!"
          });
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            type: "error",
            message: error
          });
        });
    }
  }
};
</script>