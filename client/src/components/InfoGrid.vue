<template>
  <v-container fill-height>
    <div
      class="flex-column d-flex flex-grow-1 justify-space-around fill-height text-center"
    >
      <h1 class="display-2 font-weight-bold accent--text">
        <slot name="pageTitle"></slot>
      </h1>
      <div>
        <h2 class="display-2"><slot name="messageTitle"></slot></h2>
        <h3 class="subtitle-1 mt-4"><slot></slot></h3>
      </div>
      <div>
        <slot name="action"> </slot>
      </div>
    </div>
  </v-container>
</template>
