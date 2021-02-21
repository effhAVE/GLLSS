<template>
  <v-card class="primary" flat :loading="isLoading">
    <v-card-title>Logs</v-card-title>
    <v-card-text>
      <v-container class="black">
        <ul class="logs-list" v-for="log in logs" :key="log._id">
          <li>{{ $moment(log.createdAt).format("MMMM DD HH:mm") }} <username :user="log.user"></username> {{ log.description }}</li>
        </ul>
      </v-container>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  props: {
    logParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      logs: [],
      isLoading: "accent"
    };
  },
  methods: {
    getLogs() {
      this.$http.get(`${this.APIURL}/logs/?${new URLSearchParams(this.logParams).toString()}`).then(response => {
        this.logs = response.data;
        this.isLoading = false;
      });
    }
  },
  mounted() {
    this.getLogs();
  }
};
</script>
<style lang="scss">
.logs-list {
  list-style-type: ">";
  font-size: 0.9em;
  & > li {
    padding-left: 6px;
  }
}
</style>