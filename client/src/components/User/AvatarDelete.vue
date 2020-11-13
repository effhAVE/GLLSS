<template>
  <v-card class="primary" outlined>
    <v-card-title class="headline">Are you sure?</v-card-title>
    <v-card-text>Your avatar will be deleted from the database.</v-card-text>
    <v-divider></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="onDelete"> Yes </v-btn>
      <v-btn color="success" text @click="$emit('close')"> Cancel </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  methods: {
    onDelete() {
      this.$http
        .delete(`${this.APIURL}/users/${this.$store.state.user._id}/avatar`)
        .then(response => {
          this.$emit("close");
          if (response.status >= 400) throw new Error(response.data);
          else this.$router.go();
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Avatar deleted!"
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