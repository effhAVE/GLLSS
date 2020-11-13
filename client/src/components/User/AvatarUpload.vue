<template>
  <v-row>
    <v-col>
      <v-row justify="center" class="mb-8"><v-img :src="url" max-height="250" max-width="250"></v-img></v-row>
      <v-row>
        <v-file-input
          label="Choose an image"
          outlined
          dense
          accept="image/*"
          show-size
          color="accent"
          v-model="avatar"
          @change="renderImage"
        ></v-file-input>
      </v-row>
      <v-row justify="end">
        <v-btn text @click="onAvatarSubmit" color="accent" :disabled="isUploading">Upload</v-btn>
        <v-btn text @click="$emit('close')" color="accent">Cancel</v-btn>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
export default {
  data() {
    return {
      avatar: null,
      url: "",
      isUploading: false
    };
  },
  methods: {
    renderImage() {
      if (!this.avatar) {
        this.url = "";
        return;
      }

      this.url = URL.createObjectURL(this.avatar);
    },
    onAvatarSubmit() {
      this.isUploading = true;
      const fd = new FormData();
      fd.append("avatar", this.avatar, this.avatar.name);
      this.$http
        .post(`${this.APIURL}/users/${this.$store.state.user._id}/avatar`, fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(response => {
          this.$emit("close");
          this.isUploading = false;
          if (response.status >= 400) throw new Error(response.data);
          else this.$router.go();
          this.$store.commit("snackbarMessage", {
            type: "success",
            message: "Avatar saved!"
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