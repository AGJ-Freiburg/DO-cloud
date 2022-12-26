<template>
  <v-overlay :z-index="zIndex" :value="overlay">
    <!-- ml: Let go of the mouse button, to upload document(s) -->
    <h1 v-html="$ml.get('drop_documents')"></h1>
  </v-overlay>
</template>

<script>
export default {
  name: 'Overlay',

  data: () => ({
    overlay: true,
    zIndex: 100
  })
};
</script>

<style></style>
