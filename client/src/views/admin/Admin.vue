<template>
  <div class="admin-panel">
    <h1>Admin panel</h1>
    <router-view :user="user"></router-view>
  </div>
</template>
<script>
export default {
  props: {
    user: Object
  }
};
</script>