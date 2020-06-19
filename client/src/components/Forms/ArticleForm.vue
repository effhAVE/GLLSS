<template>
  <v-row justify="center">
    <v-col cols="9">
      <v-form ref="form" style="min-width: 500px" v-model="valid">
        <v-text-field v-model="draft.title" color="accent" label="Title" :rules="validations.required"></v-text-field>
        <v-text-field v-model="draft.previewImageURL" color="accent" label="Preview image URL" :rules="validations.url"></v-text-field>
        <v-textarea v-model="draft.contentShort" label="Preview text" color="accent" outlined dense rows="4"></v-textarea>
        <v-textarea v-model="draft.content" label="Content" color="accent" outlined :rules="validations.required" rows="12"></v-textarea>
        <v-row>
          <v-spacer></v-spacer>
          <v-btn color="accent black--text" class="mt-8" text @click="$emit('submit', draft)" :disabled="!valid">
            Save
          </v-btn>
          <v-btn color="accent black--text" class="mt-8" text @click="$emit('cancel')" v-if="article">
            Cancel
          </v-btn>
        </v-row>
      </v-form>
    </v-col>
  </v-row>
</template>
<script>
import validations from "../../helpers/validations";
export default {
  props: {
    article: {
      type: Object
    }
  },
  data() {
    return {
      draft: {
        title: "New article",
        contentShort: "",
        content: "",
        previewImageURL: ""
      },
      validations: validations,
      valid: true
    };
  },
  mounted() {
    if (this.article) {
      this.draft = Object.assign({}, this.article);

      this._keyListener = function(event) {
        if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          if (this.valid) {
            this.$emit("submit", this.draft);
          } else {
            this.$store.commit("snackbarMessage", {
              message: "Article is not valid.",
              type: "error"
            });
          }
        }
      };

      document.addEventListener("keydown", this._keyListener.bind(this));
    }
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
  }
};
</script>