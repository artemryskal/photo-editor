<template>
  <v-app>
    <CanvasUpload v-if="!img" />
    <CanvasBox v-show="img" />

    <notifications position="bottom right" class="mr-4 mb-4" />
  </v-app>
</template>

<script setup>
const { img } = storeToRefs(useCanvasStore())
</script>
