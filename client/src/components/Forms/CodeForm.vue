<template>
  <v-form ref="form" style="min-width: 500px">
    <v-text-field v-if="!code" v-model.trim="splitField" color="accent" label="Combined fields" outlined></v-text-field>
    <v-text-field v-model="draft.expiration" color="accent" label="Expiration" required></v-text-field>
    <v-text-field v-model="draft.statsToken" color="accent" label="Stats token" required></v-text-field>
    <v-text-field v-model="draft.adminToken" color="accent" label="Admin token" required></v-text-field>
    <v-text-field v-model="draft.playerToken" color="accent" label="Player token" required></v-text-field>
    <div v-if="code">
      <v-textarea color="accent" label="Notes" :value="code.notes" v-model="draft.notes"></v-textarea>
    </div>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn color="accent black--text" class="mt-8" text @click="onEmit">
        Save
      </v-btn>
      <v-btn color="accent black--text" class="mt-8" text @click="$emit('cancel')" v-if="code">
        Cancel
      </v-btn>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: {
    code: Object,
    user: Object
  },
  data() {
    return {
      splitField: "",
      draft: {
        expiration: "",
        statsToken: "",
        adminToken: "",
        playerToken: ""
      }
    };
  },
  methods: {
    onEmit() {
      this.$emit("submit", this.draft);
      this.splitField = "";
    }
  },
  mounted() {
    if (this.code) {
      this.draft = Object.assign({}, this.code);
      if (!this.draft.adminToken) {
        this.$http.get(`${this.APIURL}/codes/${this.code._id}/admintoken`).then(response => {
          this.$set(this.draft, "adminToken", response.data);
        });
      }
    }
  },
  watch: {
    splitField(newValue) {
      const valuesArray = newValue.split(/\s+/);
      if (valuesArray.length === 5) {
        this.draft.expiration = `${valuesArray[0]} ${valuesArray[1]}`;
        this.draft.statsToken = valuesArray[2].split("-")[1];
        this.draft.adminToken = valuesArray[3];
        this.draft.playerToken = valuesArray[4];
      }
    }
  }
};
</script>