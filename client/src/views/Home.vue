<template>
  <pre class="home">
    {{ JSON.stringify(user, null, 2) }}
  </pre>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  computed: {
    user() {
      return this.$store.getters.user;
    }
  }
};
</script>
