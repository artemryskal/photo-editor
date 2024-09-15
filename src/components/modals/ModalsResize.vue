<template>
  <v-dialog v-model="show" max-width="500" class="resize">
    <v-card>
      <h3 class="mb-4">Масштабирование</h3>

      <!-- Способ изменения -->
      <div class="resize__label">
        Способ изменения
        <v-menu>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on">
              {{ resize.type === 'pixels' ? 'В пикселях' : 'В процентах' }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="changeType('pixels')">В пикселях</v-list-item>
            <v-list-item @click="changeType('percent')">
              В процентах
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Ширина -->
      <label class="resize__label">
        Ширина
        <v-text-field
          :value="resize.width"
          type="number"
          flat
          solo
          outlined
          hide-details
          class="resize__input"
          @input="changeWidth" />
      </label>

      <!-- Высота -->
      <label class="resize__label">
        Высота
        <v-text-field
          :value="resize.height"
          :disabled="resize.ratioSave"
          type="number"
          flat
          solo
          outlined
          hide-details
          class="resize__input"
          @input="setResize({ height: $event })" />
      </label>

      <!-- Алгоритм интерполяции -->
      <div class="resize__label">
        <div>
          Алгоритм интерполяции
          <ToolsTooltip
            msg="Ближайшие соседи: каждому пикселю нового изображения присваивается значение ближайшего пикселя исходного изображения" />
        </div>
        <v-menu>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on">Ближайшие соседи</v-btn>
          </template>
          <v-list>
            <v-list-item>Ближайшие соседи</v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Режим пропорций -->
      <div class="resize__label">
        <div>Режим пропорций</div>
        <v-menu>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on">
              {{ resize.ratioSave ? 'С сохранением' : 'Без сохранения' }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              @click="setResize({ ratioSave: true, height: resize.width })">
              С сохранением
            </v-list-item>
            <v-list-item @click="setResize({ ratioSave: false })">
              Без сохранения
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Информация до/после -->
      <div class="resize__label">
        <div>Разрешение до: {{ resolution }}</div>
        <div>Разрешение после: {{ resizeResolution }}</div>
      </div>

      <div class="resize__label">
        <!-- Кнопка отменить -->
        <v-btn color="error" outlined @click="show = false">Отменить</v-btn>
        <!-- Кнопка масштабировать -->
        <v-btn color="primary" @click="scale">Масштабировать</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import modalsMixin from '@/mixins/modals'

export default {
  name: 'ModalsResize',
  mixins: [modalsMixin],
  computed: {
    ...mapState({
      canvas: (s) => s.editorStore.canvas,
      ctx: (s) => s.editorStore.ctx,
      resize: (s) => s.editorStore.resize,
      resultData: (s) => s.editorStore.result,
    }),
    ...mapGetters({
      resolution: 'editorStore/getResolution',
      resizeResolution: 'editorStore/getResizeResolution',
    }),
  },
  methods: {
    ...mapMutations({
      setResize: 'editorStore/setResize',
      setEraseCanvas: 'editorStore/setEraseCanvas',
      setResult: 'editorStore/setResult',
    }),
    // Изменение типа значений
    changeType(type) {
      if (type === this.resize.type) return false
      this.setResize({ type })

      // Преобразуем значения из пикселей в проценты
      if (type === 'percent') {
        const width = Math.trunc(
          (this.resize.width * 100) / this.resultData.width
        )
        const height = Math.trunc(
          (this.resize.height * 100) / this.resultData.height
        )
        this.setResize({ width, height })
        return false
      }

      const width = Math.trunc(
        (this.resize.width * this.resultData.width) / 100
      )
      const height = Math.trunc(
        (this.resize.height * this.resultData.height) / 100
      )
      this.setResize({ width, height })
    },
    // Установка ширины
    changeWidth(width) {
      this.setResize({ width })
      if (!this.resize.ratioSave) return false

      const coef = this.resultData.height / this.resultData.width
      const height = Math.round(width * coef)
      this.setResize({ height })
    },
    // Метод масштабирования по ближайшему соседу
    scale() {
      // Вычисляем значения ширины/высоты
      let newWidth = this.resize.width
      let newHeight = this.resize.height
      if (this.resize.type === 'percent') {
        newWidth = Math.trunc((this.resize.width * this.resultData.width) / 100)
        newHeight = Math.trunc(
          (this.resize.height * this.resultData.height) / 100
        )
      }

      const { data } = this.ctx.getImageData(
        this.resultData.x,
        this.resultData.y,
        this.resultData.width,
        this.resultData.height
      )
      const scaleX = this.resultData.width / newWidth
      const scaleY = this.resultData.height / newHeight
      const newData = new Uint8ClampedArray(newWidth * newHeight * 4)

      for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
          const px = Math.floor(x * scaleX)
          const py = Math.floor(y * scaleY)
          const index = (y * newWidth + x) * 4
          const originalIndex = (py * this.resultData.width + px) * 4

          newData[index] = data[originalIndex]
          newData[index + 1] = data[originalIndex + 1]
          newData[index + 2] = data[originalIndex + 2]
          newData[index + 3] = data[originalIndex + 3]
        }
      }

      let newX = this.canvas.width / 2 - newWidth / 2
      let newY = this.canvas.height / 2 - newHeight / 2
      let image = new ImageData(newData, newWidth, newHeight)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.putImageData(image, newX, newY)

      this.setResult({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      })

      this.show = false
    },
  },
}
</script>

<style lang="scss" scoped>
.resize {
  &__label {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__input {
    ::v-deep {
      .v-input__control,
      .v-input__slot {
        height: 30px !important;
        min-height: 30px !important;
      }
    }
  }
}
</style>
