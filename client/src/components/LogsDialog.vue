<template>
  <v-dialog v-model="logsModal" max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn class="ml-4" v-if="$store.getters.hasPermission('logs.view')" icon v-on="on">
        <v-icon>mdi-console</v-icon>
      </v-btn>
    </template>
    <logs :logParams="logParams" />
  </v-dialog>
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
      logsModal: false
    };
  }
};
</script>