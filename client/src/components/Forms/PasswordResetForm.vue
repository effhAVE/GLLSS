<template>
  <v-form ref="form" v-model="valid">
    <v-card-text>
      <v-text-field
        id="password"
        color="accent"
        placeholder="Password"
        v-model="password"
        name="password"
        prepend-icon="mdi-lock"
        type="password"
        :rules="validations.password"
      ></v-text-field>
      <v-text-field
        id="passwordConfirmation"
        color="accent"
        placeholder="Confirm password"
        v-model="passwordConfirmation"
        name="passwordConfirmation"
        prepend-icon="mdi-lock-check"
        type="password"
        :rules="passwordRepeat"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="accent"
        class="black--text"
        large
        type="submit"
        :disabled="!valid"
        @click.prevent="$emit('submit', password)"
        >Save new password</v-btn
      >
    </v-card-actions>
  </v-form>
</template>
<script>
import validations from "../../helpers/validations";
export default {
  data() {
    return {
      password: "",
      passwordConfirmation: "",
      validations: validations,
      passwordRepeat: [
        ...validations.required,
        v => v === this.password || "Passwords do not match"
      ],
      valid: true
    };
  }
};
</script>