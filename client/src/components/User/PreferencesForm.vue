<template>
  <v-form ref="form" v-if="preferences" v-model="valid" @input="$emit('validation', $event)">
    <v-card-title>Preferences</v-card-title>
    <v-row>
      <v-col>
        <v-row class="mb-6 preferences-header">
          <h3 class="body-1 accent--text">Limits</h3>
          <h4 class="caption">How many items should be fetched when entering a page or clicking "Load more" buttons</h4>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="draft.overviewTournamentsLimitActive"
              @input="$emit('update:preferences', draft)"
              :rules="validations.overviewLimitActive"
              color="accent"
              label="Overview tournaments: Active "
              type="number"
              min="1"
              max="15"
            ></v-text-field>
            <v-text-field
              v-model="draft.overviewTournamentsLimitPast"
              @input="$emit('update:preferences', draft)"
              :rules="validations.tournamentsLimit"
              color="accent"
              label="Overview tournaments: Hosted"
              type="number"
              min="5"
              max="30"
            ></v-text-field>
            <v-text-field
              v-model="draft.tournamentsLimitActive"
              @input="$emit('update:preferences', draft)"
              :rules="validations.tournamentsLimit"
              color="accent"
              label="Tournaments list: Active"
              type="number"
              min="5"
              max="30"
            ></v-text-field>
            <v-text-field
              v-model="draft.tournamentsLimitPast"
              @input="$emit('update:preferences', draft)"
              :rules="validations.tournamentsLimit"
              color="accent"
              label="Tournaments list: Past"
              type="number"
              min="5"
              max="30"
            ></v-text-field>
            <v-text-field
              v-model="draft.seriesTournamentsLimit"
              @input="$emit('update:preferences', draft)"
              :rules="validations.tournamentsLimit"
              color="accent"
              label="Series tournaments"
              type="number"
              min="5"
              max="30"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col offset="1">
        <v-row class="mb-6 preferences-header">
          <h3 class="body-1 accent--text">Privacy</h3>
          <h4 class="caption"></h4>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              class="mt-0"
              v-model="draft.privateEmail"
              @change="$emit('update:preferences', draft)"
              label="Don't show my e-mail"
              color="accent"
            ></v-checkbox>
            <v-checkbox
              class="mt-0"
              v-model="draft.showBirthday"
              @change="$emit('update:preferences', draft)"
              label="Show birthday"
              color="accent"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-row class="mb-6 preferences-header">
          <h3 class="body-1 accent--text">Displaying</h3>
          <h4 class="caption">What elements should be displayed by default</h4>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              class="mt-0"
              v-model="draft.displayOnlyMyAccounts"
              @change="$emit('update:preferences', draft)"
              label="Display only my accounts"
              color="accent"
            ></v-checkbox>
            <v-checkbox
              class="mt-0"
              v-model="draft.displayOnlyMyCodes"
              @change="$emit('update:preferences', draft)"
              label="Display only my codes"
              color="accent"
            ></v-checkbox>
            <v-checkbox
              class="mt-0"
              v-model="draft.displayPastTournaments"
              @change="$emit('update:preferences', draft)"
              label="Display past tournaments"
              color="accent"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-col>
      <v-col offset="1"> </v-col>
    </v-row>
  </v-form>
</template>

<script>
import validations from "../../helpers/validations";
export default {
  props: {
    preferences: {
      type: Object
    }
  },
  data() {
    return {
      draft: null,
      valid: false,
      validations: validations
    };
  },
  created() {
    this.draft = Object.assign({}, this.preferences);
  }
};
</script>

<style lang="scss">
.preferences-header {
  min-height: 50px;
  display: block;
}
</style>