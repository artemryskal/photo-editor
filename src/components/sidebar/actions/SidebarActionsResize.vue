<template>
  <div>
    <v-btn elevation="0" @click="setModal('ModalsResize')">
      <v-icon size="20">mdi-resize</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SidebarActionsResize',
  methods: {
    ...mapMutations({
      setModal: 'modalsStore/setModal',
    }),
  },
}
</script>
