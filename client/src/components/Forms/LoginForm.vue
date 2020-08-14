<template>
  <v-form ref="form" v-model="valid">
    <v-card-text>
      <v-text-field
        name="email"
        color="accent"
        placeholder="Email"
        v-model="email"
        prepend-icon="mdi-email"
        type="text"
        required
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
        :rules="validations.required"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <div>
        <p class="mb-0">No account? <router-link to="/register">Register now!</router-link></p>
        <p class="mb-0">
          Or maybe you
          <router-link to="/forgot-password">forgot your password?</router-link>
        </p>
      </div>
      <v-spacer></v-spacer>
      <v-btn color="accent" class="black--text" type="submit" :disabled="!valid" @click.prevent="$emit('submit', { email, password })">Sign in</v-btn>
    </v-card-actions>
  </v-form>
</template>
<script>
import validations from "../../helpers/validations";
export default {
  data() {
    return {
      email: "",
      password: "",
      validations: validations,
      valid: true
    };
  }
};
</script>