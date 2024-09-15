<template>
  <v-dialog v-model="show" max-width="800px" persistent>
    <v-card>
      <v-card-title class="headline">
        Градационная коррекция (Curves)
      </v-card-title>
      <v-card-text>
        <div class="histogram-container">
          <!-- Отображение гистограмм для R, G, B каналов -->
          <svg width="256" height="150">
            <!-- Рамка для гистограммы -->
            <rect
              x="0"
              y="0"
              width="256"
              height="150"
              stroke="black"
              fill="none"
              stroke-width="1" />

            <!-- Деления по горизонтали -->
            <g stroke="gray" stroke-width="0.5">
              <line x1="0" y1="30" x2="256" y2="30" />
              <line x1="0" y1="60" x2="256" y2="60" />
              <line x1="0" y1="90" x2="256" y2="90" />
              <line x1="0" y1="120" x2="256" y2="120" />
            </g>

            <!-- Гистограммы для каждого канала -->
            <polyline
              :points="histogramToPoints(redHistogram)"
              stroke="red"
              fill="none" />
            <polyline
              :points="histogramToPoints(greenHistogram)"
              stroke="green"
              fill="none" />
            <polyline
              :points="histogramToPoints(blueHistogram)"
              stroke="blue"
              fill="none" />

            <!-- Линия коррекции -->
            <line
              :x1="x1"
              :y1="150 - y1"
              :x2="x2"
              :y2="150 - y2"
              stroke="black"
              stroke-width="2" />
            <!-- Линии за пределами первой и второй точки -->
            <line
              x1="0"
              :y1="150 - y1"
              :x2="x1"
              :y2="150 - y1"
              stroke="black" />
            <line
              :x1="x2"
              :y1="150 - y2"
              x2="256"
              :y2="150 - y2"
              stroke="black" />
          </svg>
        </div>

        <!-- Поля ввода для точек -->
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model.number="x1"
              label="Вход X1"
              type="number"
              min="0"
              max="255"
              :rules="[
                (v) => v >= 0 || 'Вход X1 должен быть больше или равен 0',
              ]"></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.number="y1"
              label="Выход Y1"
              type="number"
              min="0"
              max="255"
              :rules="[
                (v) => v >= 0 || 'Выход Y1 должен быть больше или равен 0',
              ]"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model.number="x2"
              label="Вход X2"
              type="number"
              min="0"
              max="255"
              :rules="[
                (v) => v >= 0 || 'Вход X2 должен быть больше или равен 0',
              ]"></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.number="y2"
              label="Выход Y2"
              type="number"
              min="0"
              max="255"
              :rules="[
                (v) => v >= 0 || 'Выход Y2 должен быть больше или равен 0',
              ]"></v-text-field>
          </v-col>
        </v-row>

        <!-- Чекбокс для предпросмотра -->
        <v-checkbox
          v-model="preview"
          label="Включить предпросмотр"></v-checkbox>

        <!-- Canvas для предпросмотра -->
        <div v-if="preview" class="preview-container">
          <canvas ref="canvasPreview" class="preview-canvas"></canvas>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="applyCorrection">Применить</v-btn>
        <v-btn color="secondary" @click="resetValues">Сброс</v-btn>
        <v-btn @click="closeDialog">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import modalsMixin from '@/mixins/modals'

export default {
  name: 'ModalsHistogram',
  mixins: [modalsMixin],
  data() {
    return {
      x1: 0, // Первая точка по оси X
      y1: 0, // Первая точка по оси Y
      x2: 255, // Вторая точка по оси X
      y2: 255, // Вторая точка по оси Y
      preview: false, // Управляет предпросмотром
      redHistogram: [], // Гистограмма красного канала
      greenHistogram: [], // Гистограмма зеленого канала
      blueHistogram: [], // Гистограмма синего канала
      histogramHeight: 150, // Высота гистограммы
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
    preview(val) {
      this.$nextTick(() => {
        if (!val) return false
        this.updatePreview()
      })
    },
    x1: 'updatePreview',
    y1: 'updatePreview',
    x2: 'updatePreview',
    y2: 'updatePreview',
    show(val) {
      if (val) {
        this.calculateHistograms()
      }
    },
  },
  methods: {
    ...mapMutations({
      setImage: 'editorStore/setImage',
    }),
    // Обновление предпросмотра
    updatePreview() {
      if (!this.preview) return false

      this.$nextTick(() => {
        const canvasPreview = this.$refs.canvasPreview
        const ctxPreview = canvasPreview.getContext('2d')
        const { width, height } = this.resultData

        // Получаем изображение из оригинального canvas
        const imageDataURL = this.canvas.toDataURL()
        const img = new Image()
        img.src = imageDataURL

        img.onload = () => {
          // Устанавливаем размеры canvasPreview как размеры изображения
          canvasPreview.width = width
          canvasPreview.height = height

          // Очищаем и отрисовываем измененное изображение на canvasPreview
          ctxPreview.clearRect(0, 0, canvasPreview.width, canvasPreview.height)
          ctxPreview.drawImage(img, 0, 0, width, height)

          // Применяем LUT ко всем пикселям изображения в previewCanvas
          const previewImageData = ctxPreview.getImageData(
            0,
            0,
            canvasPreview.width,
            canvasPreview.height
          )
          const previewData = previewImageData.data

          const lut = new Array(256).fill(0).map((_, i) => {
            if (i <= this.x1) {
              return this.y1
            } else if (i >= this.x2) {
              return this.y2
            } else {
              return (
                ((i - this.x1) * (this.y2 - this.y1)) / (this.x2 - this.x1) +
                this.y1
              )
            }
          })

          for (let i = 0; i < previewData.length; i += 4) {
            previewData[i] = lut[previewData[i]] // Красный канал
            previewData[i + 1] = lut[previewData[i + 1]] // Зеленый канал
            previewData[i + 2] = lut[previewData[i + 2]] // Синий канал
          }

          ctxPreview.putImageData(previewImageData, 0, 0)
        }
      })
    },

    // Преобразуем гистограмму в точки для отображения на графике
    histogramToPoints(histogram) {
      return histogram
        .map((value, index) => `${index},${this.histogramHeight - value}`)
        .join(' ')
    },

    // Вычисляем гистограммы для каждого цветового канала
    calculateHistograms() {
      const { width, height, x, y } = this.resultData
      const imageData = this.ctx.getImageData(x, y, width, height)
      const data = imageData.data

      const redHistogram = new Array(256).fill(0)
      const greenHistogram = new Array(256).fill(0)
      const blueHistogram = new Array(256).fill(0)

      for (let i = 0; i < data.length; i += 4) {
        redHistogram[data[i]]++
        greenHistogram[data[i + 1]]++
        blueHistogram[data[i + 2]]++
      }

      const maxRed = Math.max(...redHistogram)
      const maxGreen = Math.max(...greenHistogram)
      const maxBlue = Math.max(...blueHistogram)

      this.redHistogram = redHistogram.map(
        (value) => (value / maxRed) * this.histogramHeight
      )
      this.greenHistogram = greenHistogram.map(
        (value) => (value / maxGreen) * this.histogramHeight
      )
      this.blueHistogram = blueHistogram.map(
        (value) => (value / maxBlue) * this.histogramHeight
      )
    },

    // Применение коррекции на основе точек
    applyCorrection() {
      const { width, height, x, y } = this.resultData
      const imageData = this.ctx.getImageData(x, y, width, height)
      const data = imageData.data

      // Создаем таблицу для градационного преобразования
      const lut = new Array(256).fill(0).map((_, i) => {
        if (i <= this.x1) {
          return this.y1
        } else if (i >= this.x2) {
          return this.y2
        } else {
          return (
            ((i - this.x1) * (this.y2 - this.y1)) / (this.x2 - this.x1) +
            this.y1
          )
        }
      })

      // Применяем LUT ко всем пикселям изображения
      for (let i = 0; i < data.length; i += 4) {
        data[i] = lut[data[i]] // Красный канал
        data[i + 1] = lut[data[i + 1]] // Зеленый канал
        data[i + 2] = lut[data[i + 2]] // Синий канал
      }

      // Обновляем данные изображения
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

    // Сброс значений и гистограммы
    resetValues() {
      this.x1 = 0
      this.y1 = 0
      this.x2 = 255
      this.y2 = 255
      this.resetPreview()
      this.calculateHistograms()
    },

    // Закрытие диалога
    closeDialog() {
      this.show = false
    },

    // Сброс предпросмотра
    resetPreview() {
      const canvasPreview = this.$refs.canvasPreview
      const ctxPreview = canvasPreview.getContext('2d')
      ctxPreview.clearRect(0, 0, canvasPreview.width, canvasPreview.height)
    },
  },
}
</script>

<style scoped>
.histogram-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.preview-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.preview-canvas {
  width: 100%;
  height: 500px;
  object-fit: contain;
}
</style>
