<template>
  <v-card class="my-6 pa-6" color="primary" raised>
    <v-row class="mb-6">
      <v-col cols="auto">
        <v-img height="200px" width="200px" :src="article.previewImageURL" v-if="article.previewImageURL"></v-img>
        <v-sheet height="200px" width="200px" v-else color="primary" class="has-border">
          <v-flex align-center justify-center d-flex fill-height>
            <span class="grey--text overline">No image</span>
          </v-flex>
        </v-sheet>
      </v-col>
      <v-col>
        <v-container fill-height fluid>
          <v-layout>
            <v-flex xs12 align-start d-flex flex-column>
              <span class="headline">{{ article.title }}</span>

              <v-card-text>
                {{ article.contentShort }}
              </v-card-text>
            </v-flex>
          </v-layout>
        </v-container>
      </v-col>
    </v-row>
    <v-card-actions>
      <v-chip small color="secondary" class="white--text">
        {{ article.author.nickname }}
      </v-chip>
      <v-spacer></v-spacer>
      <span class="overline">Created: {{ article.createdAt | moment("YYYY-MM-DD HH:mm") }}</span>
      <v-spacer></v-spacer>

      <v-btn small color="accent black--text" :to="`articles/${article._id}`">Read more</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    article: {
      type: Object,
      required: true
    }
  }
};
</script>