<template>
  <v-card height="100%" color="transparent" flat>
    <v-card-title>
      Edit your profile
      <v-spacer></v-spacer>
      <v-btn text color="accent" @click="$router.go(-1)">
        <v-icon left> mdi-arrow-left </v-icon>
        Go back
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-row no-gutters>
        <Form />
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import Form from "../components/User/DetailsForm";
export default {
  components: {
    Form
  }
};
</script>