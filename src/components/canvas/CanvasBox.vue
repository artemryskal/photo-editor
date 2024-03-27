<template>
  <div class="canvas">
    <!-- Холст -->
    <canvas
      ref="canvas"
      class="canvas__el"
      @mouseenter="canvasStore.tooltip.active = true"
      @mouseleave="canvasStore.tooltip.active = false"
      @mousemove="calcDetails">
      Ваш браузер не поддерживает canvas
    </canvas>

    <!-- Тултип -->
    <CanvasTooltip />
  </div>
</template>

<script setup>
const canvasStore = useCanvasStore()
const { event } = storeToRefs(canvasStore)

const canvas = ref(null)
const context = ref(null)

onMounted(() => {
  context.value = canvas.value.getContext('2d')
})

// Метод рисования на canvas
const drawImage = () => {
  canvasStore.img.onload = () => {
    context.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    canvas.value.width = canvasStore.img.width
    canvas.value.height = canvasStore.img.height
    context.value.drawImage(
      canvasStore.img,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    )
    canvasStore.event = false
  }
}

// Вычисление текущих значений для тултипа
const calcDetails = (e) => {
  // Вычисляем положение курсора на холсте (относительно загруженного изображения)
  const rect = canvas.value.getBoundingClientRect()
  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height
  canvasStore.tooltip.x = Math.trunc((e.clientX - rect.left) * scaleX)
  canvasStore.tooltip.y = Math.trunc((e.clientY - rect.top) * scaleY)

  // Устанавливаем позицию курсора
  canvasStore.tooltip.screenX = e.clientX
  canvasStore.tooltip.screenY = e.clientY

  // Получаем цвет пикселя в rgb
  const pixel = context.value.getImageData(
    canvasStore.tooltip.x,
    canvasStore.tooltip.y,
    1,
    1
  )
  const pixelData = pixel.data
  canvasStore.tooltip.color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`
}

// Наблюдатель для перерисовки canvas
watch(event, () => {
  if (!event) return false
  drawImage()
})
</script>

<style lang="scss" scoped>
.canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
  max-height: 100%;
  flex-grow: 1;

  &__el {
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
