<template>
  <div>
    <h3 class="title">Upcoming birthdays</h3>
    <v-list color="transparent" two-line>
      <template v-for="(user, index) in birthdays">
        <v-list-item :key="user._id">
          <v-list-item-avatar>
            <v-img :src="user.avatar ? user.avatar : require('../../assets/gllss-avatar-default.png')"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title> <username :user="user"></username> <span v-if="isToday(user.birthday)">🎂✨💖</span> </v-list-item-title>
            <v-list-item-subtitle>
              {{ $moment(user.birthday).format("Do of MMMM ") }} <span class="accent--text" v-if="isToday(user.birthday)"> - TODAY!</span>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider :key="index"></v-divider>
      </template>
    </v-list>
  </div>
</template>
<script>
export default {
  props: {
    birthdays: {
      type: Array,
      required: true
    }
  },
  methods: {
    isToday(date) {
      return this.$moment().date() === this.$moment(date).date() && this.$moment().month() === this.$moment(date).month();
    }
  }
};
</script>