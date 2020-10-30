<template>
  <v-row justify="center">
    <v-col cols="11">
      <v-form ref="form" style="min-width: 500px" v-model="valid">
        <v-text-field
          v-model="draft.title"
          color="accent"
          label="Title"
          :rules="validations.required"
          :disabled="!!article && !$store.getters.hasPermission('articleProps.title')"
        ></v-text-field>
        <v-text-field
          v-model="draft.previewImageURL"
          color="accent"
          label="Preview image URL"
          :rules="validations.url"
          :disabled="!!article && !$store.getters.hasPermission('articleProps.previewImageURL')"
        ></v-text-field>
        <v-textarea
          v-model="draft.contentShort"
          label="Preview text"
          color="accent"
          outlined
          dense
          rows="4"
          :disabled="!!article && !$store.getters.hasPermission('articleProps.contentShort')"
        ></v-textarea>
        <mavon-editor
          v-model="draft.content"
          language="en"
          :value="draft.content"
          placeholder="Main content"
          class="mt-4"
          :disabled="!!article && !$store.getters.hasPermission('articleProps.content')"
        />
        <v-row>
          <v-spacer></v-spacer>
          <v-btn color="accent black--text" class="mt-8" text @click="$emit('submit', draft)" :disabled="!valid"> Save </v-btn>
          <v-btn color="accent black--text" class="mt-8" text @click="$emit('cancel')" v-if="article"> Cancel </v-btn>
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

      this._keyListener = function (event) {
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
  methods: {
    addFormatting(tag, bothSides = false) {
      const textarea = document.getElementById("content");
      const selection = this.draft.content.substring(textarea.selectionStart, textarea.selectionEnd);
      let insertion;
      if (bothSides) {
        insertion = `${tag}${selection}${tag}`;
      } else {
        insertion = `${tag} ${selection}`;
      }
      this.draft.content = this.draft.content.substring(0, textarea.selectionStart) + insertion + this.draft.content.substring(textarea.selectionEnd);
    }
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
  }
};
</script>