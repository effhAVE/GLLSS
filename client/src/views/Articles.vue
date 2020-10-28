<template>
  <v-card height="100%" color="transparent">
    <v-card-title>
      Articles
      <v-spacer></v-spacer>
      <v-btn text color="accent" v-if="$store.getters.hasPermission('articles.create')"><router-link to="articles/create">Create</router-link></v-btn>
    </v-card-title>
    <List :articles="articles" />
  </v-card>
</template>
<script>
import List from "../components/Articles/ArticlesList";
export default {
  components: {
    List
  },
  data() {
    return {
      articles: []
    };
  },
  mounted() {
    this.$http.get(`${this.APIURL}/articles/`).then(response => {
      this.articles = response.data;
    });
  }
};
</script>