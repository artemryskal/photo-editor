<template>
  <v-btn color="error" @click="setModal('')" class="close-btn">
    <v-icon>mdi-close</v-icon>
  </v-btn>
</template>

<script>
export default {
  name: 'ModalsBtn',
  methods: {
    ...mapMutations({
      setModal: 'modalsStore/setModal',
    }),
  },
}
</script>

<style lang="scss" scoped>
.close-btn {
  position: absolute;
  top: 0;
}
</style>
