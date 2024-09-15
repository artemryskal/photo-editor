<template>
  <canvas
    ref="canvas"
    class="canvas"
    @click="getColor"
    @mousedown="moveStart"
    @wheel="handleScroll"></canvas>
</template>

<script>
export default {
  name: 'CanvasBox',
  data() {
    return {
      startX: 0,
      startY: 0,
      resX: 0,
      resY: 0,
      dragging: false,
      scrollSpeed: 10, // Скорость прокрутки
    }
  },
  computed: {
    ...mapState({
      canvas: (s) => s.editorStore.canvas,
      ctx: (s) => s.editorStore.ctx,
      image: (s) => s.editorStore.image,
      resultData: (s) => s.editorStore.result,
      activeTool: (s) => s.editorStore.activeTool,
      ready: (s) => s.editorStore.ready,
    }),
    scaleFactor() {
      if (!this.image) return 0
      return Math.min(
        this.canvas.offsetWidth / this.image.width,
        this.canvas.offsetHeight / this.image.height
      )
    },
  },
  watch: {
    ready() {
      if (!this.ready) return false

      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')

      this.setCanvas({
        canvas,
        ctx,
      })
      this.drawImage()
    },
  },
  methods: {
    ...mapMutations({
      setCanvas: 'editorStore/setCanvas',
      setResult: 'editorStore/setResult',
      setDetails: 'editorStore/setDetails',
      setResize: 'editorStore/setResize',
    }),
    drawImage() {
      const imageWidth = this.image.width
      const imageHeight = this.image.height
      const canvasWidth = this.canvas.offsetWidth
      const canvasHeight = this.canvas.offsetHeight

      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight

      if (imageWidth > canvasWidth || imageHeight > canvasHeight) {
        const width = imageWidth * this.scaleFactor
        const height = imageHeight * this.scaleFactor
        const x = this.canvas.width / 2 - width / 2
        const y = this.canvas.height / 2 - height / 2
        this.setResult({ x, y, width: imageWidth, height: imageHeight })
        this.setResize({ width, height })
        this.ctx.drawImage(this.image, x, y, width, height)
        return false
      }

      const x = (canvasWidth - imageWidth) / 2
      const y = (canvasHeight - imageHeight) / 2
      this.setResult({ x, y, width: imageWidth, height: imageHeight })
      this.setResize({ width: imageWidth, height: imageHeight })
      this.ctx.drawImage(this.image, x, y, imageWidth, imageHeight)
    },
    getColor(e) {
      if (this.activeTool !== 'pipette') return false

      const { left, top } = this.canvas.getBoundingClientRect()
      const resultData = this.resultData
      const x = e.pageX - left
      const y = e.pageY - top

      const xCondition =
        x >= resultData.x && x <= resultData.x + resultData.width
      const yCondition =
        y >= resultData.y && y <= resultData.y + resultData.height

      if (!xCondition || !yCondition) return false

      const pixel = this.ctx.getImageData(x, y, 1, 1)
      const pixelData = pixel.data
      const position = e.altKey || e.shiftKey || e.ctrlKey ? 1 : 0
      this.setDetails({
        position,
        x: Math.trunc(x - resultData.x),
        y: Math.trunc(y - resultData.y),
        color: pixelData,
      })
    },
    moveStart(e) {
      if (this.activeTool !== 'move') return false

      this.startX = e.pageX
      this.startY = e.pageY

      document.addEventListener('mousemove', this.move)
      document.addEventListener('mouseup', this.moveEnd)

      this.dragging = true
    },
    move(e) {
      if (!this.dragging) return false

      const stepX = e.pageX - this.startX
      const stepY = e.pageY - this.startY
      this.resX = this.resultData.x + stepX
      this.resY = this.resultData.y + stepY

      const canvasWidth = this.canvas.width
      const canvasHeight = this.canvas.height
      const imageWidth = this.resultData.width
      const imageHeight = this.resultData.height

      // Ограничение по оси X
      if (this.resX > canvasWidth - 20) {
        this.resX = canvasWidth - 20
      } else if (this.resX + imageWidth < 20) {
        this.resX = 20 - imageWidth
      }

      // Ограничение по оси Y
      if (this.resY > canvasHeight - 20) {
        this.resY = canvasHeight - 20
      } else if (this.resY + imageHeight < 20) {
        this.resY = 20 - imageHeight
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(
        this.image,
        this.resX,
        this.resY,
        imageWidth,
        imageHeight
      )
    },
    moveEnd(e) {
      this.dragging = false
      this.setResult({
        x: this.resX,
        y: this.resY,
      })

      document.removeEventListener('mousedown', this.moveStart)
      document.removeEventListener('mousemove', this.move)
    },
    // Метод для перемещения изображения с помощью прокрутки
    handleScroll(e) {
      // Проверка, чтобы скролл работал только при значительных изменениях
      const deltaY =
        e.deltaY > 0 ? this.scrollSpeed : e.deltaY < 0 ? -this.scrollSpeed : 0
      const deltaX =
        e.deltaX > 0 ? this.scrollSpeed : e.deltaX < 0 ? -this.scrollSpeed : 0

      if (deltaX === 0 && deltaY === 0) return

      this.resY = this.resultData.y + deltaY
      this.resX = this.resultData.x + deltaX

      const canvasWidth = this.canvas.width
      const canvasHeight = this.canvas.height
      const imageWidth = this.resultData.width
      const imageHeight = this.resultData.height

      // Ограничение по оси Y при скролле
      if (this.resY > canvasHeight - 20) {
        this.resY = canvasHeight - 20
      } else if (this.resY + imageHeight < 20) {
        this.resY = 20 - imageHeight
      }

      // Ограничение по оси X при скролле
      if (this.resX > canvasWidth - 20) {
        this.resX = canvasWidth - 20
      } else if (this.resX + imageWidth < 20) {
        this.resX = 20 - imageWidth
      }

      // Очищаем холст и рисуем изображение с новыми координатами
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(
        this.image,
        this.resX,
        this.resY,
        imageWidth,
        imageHeight
      )

      // Обновляем данные в store
      this.setResult({
        x: this.resX,
        y: this.resY,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.canvas {
  width: 100%;
  height: 100%;
}
</style>
