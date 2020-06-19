<template>
  <v-card class="primary has-border" outlined tile v-if="article">
    <v-img height="350px" :src="article.previewImageURL" v-if="article.previewImageURL"></v-img>
    <v-container fill-height fluid>
      <v-layout>
        <v-flex xs12 align-end d-flex justify-space-between>
          <span class="headline">{{ article.title }}</span>
          <div>
            <v-dialog v-model="editArticleModal" persistent>
              <template v-slot:activator="{ on }">
                <v-btn class="accent mr-4" icon v-if="user.roles.includes('admin')" v-on="on">
                  <v-icon color="black">mdi-pencil</v-icon>
                </v-btn>
              </template>
              <v-card class="primary">
                <v-card-text>
                  <v-container>
                    <ArticleForm :article="article" @cancel="editArticleModal = false" @submit="editArticle" />
                  </v-container>
                </v-card-text>
              </v-card>
            </v-dialog>
            <v-dialog v-model="deleteArticleModal" persistent max-width="600px">
              <template v-slot:activator="{ on }">
                <v-btn class="error" icon v-if="user.roles.includes('admin')" v-on="on">
                  <v-icon color="black">mdi-delete</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="headline">Are you sure?</v-card-title>
                <v-card-text>You're about to delete {{ article.title }} from the database. This action cannot be undone.</v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" text @click="deleteArticle">
                    Yes
                  </v-btn>
                  <v-btn color="success" text @click="deleteArticleModal = false">
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
    <v-card-text>
      <vue-markdown class="markdown" :source="article.content"></vue-markdown>
    </v-card-text>
    <v-card-actions>
      <p class="subtitle-2 ma-0">
        Author: <span class="accent--text">{{ article.author.nickname }}</span>
      </p>
      <v-spacer></v-spacer>
      <p class="subtitle-2 ma-0">
        <span>Created: {{ article.createdAt | moment("YYYY-MM-DD HH:mm") }}</span> <br />
        <span>Last update: {{ article.updatedAt | moment("YYYY-MM-DD HH:mm") }}</span>
      </p>
    </v-card-actions>
  </v-card>
</template>

<script>
import VueMarkdown from "vue-markdown";
import ArticleForm from "../../components/Forms/ArticleForm";
export default {
  props: {
    user: Object
  },
  data() {
    return {
      id: this.$route.params.articleID,
      article: null,
      editArticleModal: false,
      deleteArticleModal: false
    };
  },
  components: {
    VueMarkdown,
    ArticleForm
  },
  methods: {
    getArticle(id) {
      this.$http.get(`${this.APIURL}/articles/${id}`).then(response => {
        this.article = response.data;
      });
    },
    editArticle(article) {
      this.$http
        .put(`${this.APIURL}/articles/${article._id}`, article)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Article successfully edited!",
            type: "success"
          });
          this.$router.go();
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while editing the article.",
            type: "error"
          });
        });
    },
    deleteArticle() {
      this.$http
        .delete(`${this.APIURL}/articles/${this.article._id}`)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Article successfully deleted!",
            type: "success"
          });
          this.$router.push("/articles");
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while deleting the article.",
            type: "error"
          });
        });
    }
  },
  watch: {
    "$route.params": {
      handler(newValue) {
        const { articleID } = newValue;
        if (articleID) {
          this.getArticle(articleID);
        } else {
          this.article = null;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="scss">
.theme--dark.v-sheet .markdown {
  p {
    font-size: 0.95em;
  }

  h1 {
    margin-bottom: 1em;
  }

  h2 {
    margin-bottom: 0.5em;
  }

  h3 {
    margin-bottom: 0.2em;
  }
}
</style>