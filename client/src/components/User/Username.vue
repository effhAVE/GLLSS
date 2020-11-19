<template>
  <router-link :to="`/users/${user._id}`" v-if="user._id !== $store.state.user._id">{{ user.nickname }}</router-link>
  <span class="font-weight-bold" v-else><v-icon color="accent" small class="mx-1">mdi-account-arrow-left</v-icon>{{ user.nickname }}</span>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  }
};
</script>