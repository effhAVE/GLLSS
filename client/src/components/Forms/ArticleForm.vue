<template>
  <v-row justify="center">
    <v-col cols="9">
      <v-form ref="form" style="min-width: 500px" v-model="valid">
        <v-text-field v-model="draft.title" color="accent" label="Title" :rules="validations.required"></v-text-field>
        <v-text-field v-model="draft.previewImageURL" color="accent" label="Preview image URL" :rules="validations.url"></v-text-field>
        <v-textarea v-model="draft.contentShort" label="Preview text" color="accent" outlined dense rows="4"></v-textarea>
        <v-container fluid class="pa-0">
          <v-row>
            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('**', true)">
                <v-icon>mdi-format-bold</v-icon>
              </v-btn>
            </v-col>

            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('_', true)">
                <v-icon>mdi-format-italic</v-icon>
              </v-btn>
            </v-col>

            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('~~', true)">
                <v-icon>mdi-format-strikethrough</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('#')">
                <v-icon>mdi-format-header-1</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('##')">
                <v-icon>mdi-format-header-2</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('###')">
                <v-icon>mdi-format-header-3</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('####')">
                <v-icon>mdi-format-header-4</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('#####')">
                <v-icon>mdi-format-header-5</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn icon @click="addFormatting('*')">
                <v-icon>mdi-format-list-bulleted</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-textarea v-model="draft.content" label="Content" color="accent" outlined :rules="validations.required" rows="12" id="content"></v-textarea>
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