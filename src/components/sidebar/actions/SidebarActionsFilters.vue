<template>
  <div>
    <v-btn elevation="0" @click="setModal('ModalsFilters')">
      <v-icon size="20">mdi-palette</v-icon>
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
