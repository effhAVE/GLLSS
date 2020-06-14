<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Create an article
    </v-card-title>
    <ArticleForm @submit="saveArticle" />
  </v-card>
</template>
<script>
import ArticleForm from "../components/Forms/ArticleForm";
export default {
  props: {
    article: {
      type: Object
    }
  },
  components: {
    ArticleForm
  },
  data() {
    return {
      draft: {
        title: "New article",
        contentShort: "",
        content: "",
        previewImageURL: ""
      }
    };
  },
  methods: {
    saveArticle(article) {
      this.$http
        .post(`${this.APIURL}/articles/`, article)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Article saved!",
            type: "success"
          });
          this.$router.push("/articles");
        })
        .catch(error =>
          this.$store.commit("snackbarMessage", {
            message: error.response.data || "Error while saving",
            type: "error"
          })
        );
    }
  }
};
</script>