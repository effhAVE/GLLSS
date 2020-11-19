<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Edit your profile
      <v-spacer></v-spacer>
      <v-btn text color="accent" to="/me" exact>
        <v-icon left> mdi-arrow-left </v-icon>
        To my profile
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-row v-if="user">
        <v-col cols="4"><Details :details.sync="user.details" @validation="detailsFormValid = $event" /></v-col>
        <v-col offset="1"><Preferences :preferences.sync="user.preferences" @validation="preferencesFormValid = $event" /></v-col>
      </v-row>
    </v-card-text>

    <v-btn color="success" @click="saveChanges" :disabled="!detailsFormValid || !preferencesFormValid" fab bottom right fixed large>
      <v-icon>mdi-check</v-icon>
    </v-btn>
  </v-card>
</template>
<script>
import Details from "../components/User/DetailsForm";
import Preferences from "../components/User/PreferencesForm";
export default {
  components: {
    Details,
    Preferences
  },
  data() {
    return {
      user: null,
      detailsFormValid: false,
      preferencesFormValid: false
    };
  },
  created() {
    this.$http.get(`${this.APIURL}/users/me?fields=preferences,details`).then(response => {
      this.user = response.data;
      if (this.user.details.birthday) {
        this.user.details.birthday = this.$moment(this.user.details.birthday).format("YYYY-MM-DD");
      }
    });
  },

  methods: {
    saveChanges() {
      this.$http
        .patch(`${this.APIURL}/users/me/`, { details: this.user.details, preferences: this.user.preferences })
        .then(response => {
          if (response.status >= 400) throw new Error(response.data);
          this.$store.dispatch("getUserPreferences");
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