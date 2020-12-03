<template>
  <v-form ref="form">
    <v-card-title>Integrations</v-card-title>
    <v-btn
      :href="`${APIURL}/auth/discord/login?token=${$store.state.user._id}-${$store.state.tokenExpiry}`"
      style="background-color: #7289da; color: white"
      v-if="!accounts.discord.user"
    >
      Discord
    </v-btn>
    <v-card color="#7289da" v-else>
      <div class="d-flex flex-no-wrap align-center">
        <v-avatar class="ma-3" size="50">
          <v-img :src="`https://cdn.discordapp.com/avatars/${accounts.discord.user.id}/${accounts.discord.user.avatar}.png?size=64`"></v-img>
        </v-avatar>
        <div>
          <v-card-title>{{ accounts.discord.user.username }}</v-card-title>
          <v-card-subtitle>#{{ accounts.discord.user.discriminator }}</v-card-subtitle>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon title="Disconnect Discord" class="mr-2" @click="disconnectDiscord">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-form>
</template>

<script>
export default {
  props: {
    accounts: {
      type: Object
    }
  },
  methods: {
    disconnectDiscord() {
      this.$http.post(`${this.APIURL}/auth/discord/logout`).then(response => {
        this.$emit("fetch");
        this.$store.commit("snackbarMessage", {
          type: "success",
          message: "Successfully disconnected."
        });
      });
    }
  }
};
</script>