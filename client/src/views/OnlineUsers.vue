<template>
  <v-card height="100%" color="transparent">
    <v-card-title> Online users </v-card-title>
    <v-card-subtitle> Last 15 minutes </v-card-subtitle>
    <v-card-text>
      <v-list color="transparent" two-line>
        <template v-for="(user, index) in $store.state.onlineUsers">
          <v-list-item :key="user._id">
            <v-list-item-avatar>
              <v-img :src="user.avatar ? user.avatar.url : require('../assets/gllss-avatar-default.png')"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title> <username :user="user"></username></v-list-item-title>
              <v-list-item-subtitle>
                Last seen {{ user.seen | moment("from", $store.state.now) }} in
                <router-link :to="{ name: user.source.name, params: user.source.params }">{{ user.source.name }}</router-link>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider :key="index"></v-divider>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>