<template>
  <div class="admin-panel">
    <h1>Admin panel</h1>
    <router-view
      @snackbarMessage="$emit('snackbarMessage', $event)"
    ></router-view>
  </div>
</template>