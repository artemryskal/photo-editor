<template>
  <div class="actions">
    <!-- Масштабирование -->
    <SidebarActionsResize />
    <!-- Сохранение -->
    <SidebarActionsSave />
    <!-- Пипетка -->
    <SidebarActionsPipette />
    <!-- Перемещение -->
    <SidebarActionsMove />
    <!-- Гистограмма -->
    <SidebarActionsHistogram />
    <!-- Фильтры -->
    <SidebarActionsFilters />
  </div>
</template>

<script>
export default {
  name: 'SidebarActions',
}
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  ::v-deep {
    .v-btn {
      $size: 32px;
      padding: 0 !important;
      width: $size !important;
      height: $size !important;
      min-width: $size !important;
    }
  }
}
</style>
