<template>
  <InfoGrid>
    <template v-slot:pageTitle>
      404 - Page not found
    </template>
    <template v-slot:messageTitle>
      {{ randomMessage.title }}
    </template>
    <slot>{{ randomMessage.message }}</slot>
    <template v-slot:action>
      <v-btn color="accent black--text" @click="$router.go(-1)"
        >Take me back!</v-btn
      >
    </template>
  </InfoGrid>
</template>

<script>
import InfoGrid from "../../components/InfoGrid";

export default {
  name: "Page404",
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
          title: "You are lost in the woods...",
          message: "... and I don't know what path you are on."
        },
        {
          title: "Hmmm...",
          message: "How did you end up here?"
        },
        {
          title: "Wrong address!",
          message: "This place... you shouldn't be here."
        },
        {
          title: "Nothing to find here.",
          message:
            "I guess it would have been an amazing place... but unfortunately we don't have anything here."
        },
        {
          title: "Not a step back!",
          message:
            "Actually... you have to. There is nothing I can show you here."
        },
        {
          title: "Typo?",
          message:
            "Or someone sent you a wrong link. Or you smashed a keyboard before pressing ENTER. Or someone sent you a link after smashing their keyboard. Anyway, wrong address!"
        },
        {
          title: "Game over",
          message: "The darkness of the 404 page is all that awaits you now."
        }
      ]
    };
  }
};
</script>