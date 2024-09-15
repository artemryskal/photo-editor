<template>
  <div class="sidebar-details">
    <!-- Информация об исходном изображении -->
    <div class="d-flex flex-column align-start">
      <p>Исходная ширина: {{ result.width }}px</p>
      <p class="mb-0">Исходная высота: {{ result.height }}px</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarDetails',
  computed: {
    ...mapState({
      result: (s) => s.editorStore.result,
    }),
  },
}
</script>

<style lang="scss" scoped>
.sidebar-details {
  &__color {
    width: 48px;
    height: 48px;
    border-radius: 10px;
  }
}
</style>
