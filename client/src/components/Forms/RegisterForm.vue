<template>
  <v-form ref="form" v-model="valid">
    <v-card-text>
      <v-text-field
        name="nickname"
        color="accent"
        placeholder="Nickname"
        v-model.trim="nickname"
        prepend-icon="mdi-account"
        type="text"
        :rules="validations.nickname"
      ></v-text-field>
      <v-text-field
        name="email"
        color="accent"
        placeholder="Email"
        v-model.trim="email"
        prepend-icon="mdi-email"
        type="text"
        :rules="validations.email"
      ></v-text-field>

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
      <p class="mb-0">Already have an account? <a href="/login">Sign in!</a></p>
      <v-spacer></v-spacer>
      <v-btn
        color="accent"
        class="black--text"
        large
        type="submit"
        :disabled="!valid"
        @click.prevent="$emit('submit', { email, password, nickname })"
        >Register</v-btn
      >
    </v-card-actions>
  </v-form>
</template>
<script>
import validations from "../../helpers/validations";
export default {
  data() {
    return {
      nickname: "",
      email: "",
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