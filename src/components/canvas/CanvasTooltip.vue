<template>
  <div
    v-if="tooltip.active"
    class="tooltip"
    :style="{ top: `${tooltip.screenY}px`, left: `${tooltip.screenX}px` }">
    <!-- Цвет -->
    <div class="d-flex align-center justify-space-between">
      Color: {{ tooltip.color }}
      <div
        class="tooltip__color ml-2"
        :style="{ backgroundColor: tooltip.color }"></div>
    </div>

    <!-- Координаты -->
    <span>X: {{ tooltip.x }}</span>
    <span>Y: {{ tooltip.y }}</span>
  </div>
</template>

<script setup>
const { tooltip } = storeToRefs(useCanvasStore())
</script>

<style lang="scss" scoped>
.tooltip {
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px 10px;
  min-width: 250px;
  border-radius: 10px;
  backdrop-filter: blur(5px);
  transform: translateY(-100%);

  &__color {
    width: 25px;
    height: 25px;
  }
}
</style>
