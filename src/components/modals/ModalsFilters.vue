<template>
  <v-dialog v-model="show" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">Фильтры</v-card-title>
      <v-card-text>
        <!-- Выбор предустановленного фильтра -->
        <v-select
          v-model="selectedFilter"
          :items="presetFilters"
          item-text="label"
          item-value="value"
          label="Выберите фильтр"
          @change="applyPresetFilter"></v-select>

        <!-- Поля ввода для ядра свертки -->
        <v-row>
          <v-col v-for="(value, index) in kernelValues" :key="index" cols="4">
            <v-text-field
              v-model.number="kernelValues[index]"
              type="number"
              min="-100"
              max="100"
              step="1"
              :label="`Коэффициент ${index + 1}`"
              :rules="[
                (v) =>
                  (v >= -100 && v <= 100) ||
                  'Значение должно быть от -100 до 100',
              ]"></v-text-field>
          </v-col>
        </v-row>

        <!-- Чекбокс для предпросмотра -->
        <v-checkbox
          v-model="previewFilters"
          label="Включить предпросмотр"></v-checkbox>

        <!-- Canvas для предпросмотра -->
        <div v-if="previewFilters" class="preview-container">
          <canvas ref="canvasPreviewFilters" class="preview-canvas"></canvas>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="applyFilter">Применить</v-btn>
        <v-btn color="secondary" @click="resetFilter">Сброс</v-btn>
        <v-btn @click="closeDialog">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import modalsMixin from '@/mixins/modals'

export default {
  name: 'ModalsFilters',
  mixins: [modalsMixin],
  data() {
    return {
      kernelValues: Array(9).fill(0), // Значения ядра свертки
      selectedFilter: null, // Выбранный предустановленный фильтр
      previewFilters: false, // Управляет предпросмотром фильтров
      presetFilters: [
        {
          label: 'Тождественное отображение',
          value: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        },
        {
          label: 'Повышение резкости',
          value: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
        },
        { label: 'Фильтр Гаусса (3x3)', value: [1, 2, 1, 2, 4, 2, 1, 2, 1] },
        { label: 'Прямоугольное размытие', value: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
      ],
    }
  },
  computed: {
    ...mapState({
      canvas: (state) => state.editorStore.canvas,
      ctx: (state) => state.editorStore.ctx,
      resultData: (state) => state.editorStore.result,
      ready: (state) => state.editorStore.ready,
    }),
  },
  watch: {
    previewFilters(val) {
      this.$nextTick(() => {
        if (val) {
          this.updateFilterPreview()
        } else {
          this.resetFilterPreview()
        }
      })
    },
  },
  methods: {
    ...mapMutations({
      setImage: 'editorStore/setImage',
    }),
    // Устанавливаем "Тождественное отображение" как выбранное значение по умолчанию
    setDefaultFilter() {
      const defaultFilter = this.presetFilters.find(
        (f) =>
          JSON.stringify(f.value) ===
          JSON.stringify([0, 0, 0, 0, 1, 0, 0, 0, 0])
      )
      if (defaultFilter) {
        this.selectedFilter = defaultFilter.value
        this.kernelValues = [...defaultFilter.value]
        this.updateFilterPreview()
      }
    },

    // Обновление предпросмотра фильтров
    updateFilterPreview() {
      if (!this.previewFilters) return

      this.$nextTick(() => {
        const canvasPreviewFilters = this.$refs.canvasPreviewFilters
        const ctxPreviewFilters = canvasPreviewFilters.getContext('2d')
        const { width, height } = this.resultData

        // Получаем изображение из оригинального canvas
        const imageDataURL = this.canvas.toDataURL()
        const img = new Image()
        img.src = imageDataURL

        img.onload = () => {
          // Устанавливаем размеры canvasPreviewFilters как размеры изображения
          canvasPreviewFilters.width = width
          canvasPreviewFilters.height = height

          // Очищаем и отрисовываем измененное изображение на canvasPreviewFilters
          ctxPreviewFilters.clearRect(
            0,
            0,
            canvasPreviewFilters.width,
            canvasPreviewFilters.height
          )
          ctxPreviewFilters.drawImage(img, 0, 0, width, height)

          // Применяем ядро свертки ко всем пикселям изображения в previewCanvas
          const previewImageData = ctxPreviewFilters.getImageData(
            0,
            0,
            canvasPreviewFilters.width,
            canvasPreviewFilters.height
          )
          const previewData = previewImageData.data

          this.applyKernel(
            previewData,
            canvasPreviewFilters.width,
            canvasPreviewFilters.height
          )

          ctxPreviewFilters.putImageData(previewImageData, 0, 0)
        }
      })
    },

    // Применение фильтра к изображению
    applyFilter() {
      if (!this.canvas || !this.ctx) {
        console.error('Canvas or context is not available.')
        return
      }

      const { width, height, x, y } = this.resultData
      if (!width || !height) {
        console.error('Result data is not properly defined.')
        return
      }

      const imageData = this.ctx.getImageData(x, y, width, height)
      const data = imageData.data

      this.applyKernel(data, width, height)

      // Обновляем данные изображения в editorStore.canvas
      this.ctx.putImageData(imageData, x, y)

      const helperCanvas = document.createElement('canvas')
      const helperCtx = helperCanvas.getContext('2d')
      helperCanvas.width = imageData.width
      helperCanvas.height = imageData.height
      helperCtx.putImageData(imageData, 0, 0)

      const newImage = new Image()
      newImage.src = helperCanvas.toDataURL()
      newImage.onload = () => {
        this.closeDialog()
        this.setImage(newImage)
      }
    },

    // Применение ядра свертки
    // Применение ядра свертки
    applyKernel(data, width, height) {
      const kernelSize = 3
      const kernelHalf = Math.floor(kernelSize / 2)
      const kernel = this.kernelValues

      const pad = (kernelSize - 1) / 2
      const expandedWidth = width + pad * 2
      const expandedHeight = height + pad * 2
      const expandedData = new Uint8ClampedArray(
        expandedWidth * expandedHeight * 4
      )

      // Расширение изображения
      for (let y = 0; y < expandedHeight; y++) {
        for (let x = 0; x < expandedWidth; x++) {
          const srcX = Math.min(Math.max(x - pad, 0), width - 1)
          const srcY = Math.min(Math.max(y - pad, 0), height - 1)
          const srcIndex = (srcY * width + srcX) * 4
          const destIndex = (y * expandedWidth + x) * 4

          expandedData[destIndex] = data[srcIndex]
          expandedData[destIndex + 1] = data[srcIndex + 1]
          expandedData[destIndex + 2] = data[srcIndex + 2]
          expandedData[destIndex + 3] = data[srcIndex + 3]
        }
      }

      // Применение ядра свертки
      const resultData = new Uint8ClampedArray(width * height * 4)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const destIndex = (y * width + x) * 4
          let r = 0,
            g = 0,
            b = 0,
            kernelSum = 0

          for (let ky = 0; ky < kernelSize; ky++) {
            for (let kx = 0; kx < kernelSize; kx++) {
              const srcX = x + kx - kernelHalf
              const srcY = y + ky - kernelHalf
              const srcIndex = ((srcY + pad) * expandedWidth + (srcX + pad)) * 4
              const kIndex = ky * kernelSize + kx

              if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                r += expandedData[srcIndex] * kernel[kIndex]
                g += expandedData[srcIndex + 1] * kernel[kIndex]
                b += expandedData[srcIndex + 2] * kernel[kIndex]
                kernelSum += kernel[kIndex]
              }
            }
          }

          // Normalize and clamp values
          resultData[destIndex] = Math.min(255, Math.max(0, r / kernelSum))
          resultData[destIndex + 1] = Math.min(255, Math.max(0, g / kernelSum))
          resultData[destIndex + 2] = Math.min(255, Math.max(0, b / kernelSum))
          resultData[destIndex + 3] = 255 // Alpha
        }
      }

      // Копирование результата в оригинальные данные
      for (let i = 0; i < data.length; i++) {
        data[i] = resultData[i]
      }
    },

    // Сброс фильтра
    resetFilter() {
      this.kernelValues = Array(9).fill(0)
      this.selectedFilter = null
      this.updateFilterPreview()
    },

    // Применение предустановленного фильтра
    applyPresetFilter() {
      const preset = this.presetFilters.find(
        (f) => JSON.stringify(f.value) === JSON.stringify(this.selectedFilter)
      )
      if (preset) {
        this.kernelValues = [...preset.value]
        this.updateFilterPreview()
      }
    },

    // Закрытие модального окна
    closeDialog() {
      this.show = false
    },

    // Сброс предпросмотра
    resetFilterPreview() {
      const canvasPreviewFilters = this.$refs.canvasPreviewFilters
      const ctxPreviewFilters = canvasPreviewFilters.getContext('2d')
      ctxPreviewFilters.clearRect(
        0,
        0,
        canvasPreviewFilters.width,
        canvasPreviewFilters.height
      )
    },
  },

  mounted() {
    this.setDefaultFilter()
  },
}
</script>

<style scoped>
.preview-container {
  margin-top: 20px;
}
.preview-canvas {
  width: 100%;
  height: auto;
}
</style>
