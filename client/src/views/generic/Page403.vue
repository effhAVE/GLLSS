<template>
  <InfoGrid>
    <template v-slot:pageTitle>
      403 - Forbidden
    </template>
    <template v-slot:messageTitle>
      {{ randomMessage.title }}
    </template>
    <slot>{{ randomMessage.message }}</slot>
    <template v-slot:action>
      <v-btn color="accent black--text" @click="$router.go(-1)"
        >I'll be back!</v-btn
      >
    </template>
  </InfoGrid>
</template>

<script>
import InfoGrid from "../../components/InfoGrid";

export default {
  name: "Page403",
  components: {
    InfoGrid
  },
  computed: {
    randomMessage() {
      return this.messages[Math.floor(Math.random() * this.messages.length)];
    }
  },
  data() {
    return {
      messages: [
        {
          title: "Not today, son...",
          message:
            "... not everything is allowed with your experience. Come back later."
        },
        {
          title: "I'm sorry...",
          message:
            "Someone must've made a mistake while settings permissions. Because you should have permissions, right? Right?"
        },
        {
          title: "Did somebody say permissions?",
          message: ""
        }
      ]
    };
  }
};
</script>