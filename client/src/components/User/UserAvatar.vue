<template>
  <v-hover v-slot="{ hover }">
    <v-img
      class="user-avatar"
      :src="user.details.avatar ? user.details.avatar.url : require('../../assets/gllss-avatar-default.png')"
      height="250"
      width="250"
    >
      <v-fade-transition>
        <v-overlay v-if="hover && user._id === $store.state.user._id" absolute color="primary">
          <v-sheet height="250" width="250" color="transparent" tile>
            <v-row class="pa-4" justify="end">
              <v-btn top right icon small class="accent" @click="uploadModal = true"><v-icon color="black" small>mdi-pencil</v-icon></v-btn>
              <v-btn top right icon small class="error ml-2" @click="deleteModal = true" v-if="user.details.avatar">
                <v-icon color="black" small>mdi-delete</v-icon>
              </v-btn>
            </v-row>
          </v-sheet>
        </v-overlay>
      </v-fade-transition>

      <v-dialog v-model="uploadModal" persistent max-width="600px">
        <v-card class="primary">
          <v-card-text>
            <v-container>
              <AvatarUpload @close="uploadModal = false" />
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteModal" persistent max-width="600px">
        <AvatarDelete @close="deleteModal = false" />
      </v-dialog>
    </v-img>
  </v-hover>
</template>
<script>
import AvatarUpload from "./AvatarUpload";
import AvatarDelete from "./AvatarDelete";
export default {
  props: {
    user: Object
  },
  components: {
    AvatarUpload,
    AvatarDelete
  },
  data() {
    return {
      uploadModal: false,
      deleteModal: false
    };
  }
};
</script>
<style lang="scss">
.user-avatar {
  border: 1px solid rgba(255, 255, 255, 0.13);
}
</style>