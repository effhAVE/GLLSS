<template>
  <v-layout row wrap align-center>
    <v-flex xs8 offset-md2>
      <div v-for="article in articles" :key="article.title">
        <ArticlePreview :article="article" />
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import ArticlePreview from "./ArticlePreview";
export default {
  components: {
    ArticlePreview
  },
  props: {
    articles: {
      type: Array,
      default: () => []
    }
  }
};
</script>