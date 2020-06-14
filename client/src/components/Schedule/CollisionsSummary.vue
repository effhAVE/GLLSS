<template>
  <v-dialog v-model="show" persistent max-width="600px">
    <v-card class="primary">
      <v-card-text>
        <v-container>
          <ul v-if="collisions">
            <li v-for="(collisionObject, index) in collisions" :key="index">
              {{ collisionObject.nickname }}: {{ collisionObject.round }} inside {{ collisionObject.tournament }} collides with other rounds. <br />
              Found collisions:
              <ul>
                <li v-for="(foundCollisions, cIndex) in collisionObject.collision" :key="cIndex">
                  {{ foundCollisions.tournament }} - {{ foundCollisions.name }}
                </li>
              </ul>
            </li>
          </ul>
          <span v-else>Nothing to display.</span>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="accent" text @click="$emit('close')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    collisions: Array,
    show: Boolean
  }
};
</script>