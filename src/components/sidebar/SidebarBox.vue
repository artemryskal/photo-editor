<template>
  <v-navigation-drawer app permanent class="sidebar pa-3">
    <!-- Действия с канвасом -->
    <SidebarActions />
    <!-- Информация о пикселе -->
    <SidebarPixel class="flex-grow-1" />
    <!-- Подробности -->
    <SidebarDetails v-if="ready" />
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'SidebarBox',
  computed: {
    ...mapState({
      ready: (s) => s.editorStore.ready,
    }),
  },
}
</script>

<style lang="scss" scoped>
.sidebar {
  ::v-deep {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
