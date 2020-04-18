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
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="accent"
        class="black--text"
        large
        type="submit"
        :disabled="!valid"
        @click.prevent="$emit('submit', email)"
        >Send email</v-btn
      >
    </v-card-actions>
  </v-form>
</template>
<script>
import validations from "../../helpers/validations";
export default {
  data() {
    return {
      email: "",
      validations: validations,
      valid: true
    };
  }
};
</script>