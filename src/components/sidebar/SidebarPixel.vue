<template>
  <div class="sidebar-pixel">
    <div v-for="(item, i) in details" :key="i" class="sidebar-pixel__item">
      <!-- Цвет -->
      <div
        class="sidebar-pixel__color"
        :style="{ backgroundColor: getRGB(item.color) }"></div>
      <!-- XYZ -->
      <div class="sidebar-pixel__option">
        <span>XYZ:</span>
        {{ getXYZ(item.color) }}
      </div>
      <!-- RGB -->
      <div class="sidebar-pixel__option">
        <span>RGB:</span>
        {{ `${item.color[0]},${item.color[1]},${item.color[2]}` }}
      </div>
      <!-- LAB -->
      <div class="sidebar-pixel__option">
        <span>LAB:</span>
        {{ getLab(item.color) }}
      </div>
      <!-- Позиция X -->
      <div class="sidebar-pixel__option">
        <span>X:</span>
        {{ item.x }}
      </div>
      <!-- Позиция Y -->
      <div class="sidebar-pixel__option">
        <span>Y:</span>
        {{ item.y }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarPixel',
  computed: {
    ...mapState({
      details: (s) => s.editorStore.details,
    }),
  },
  methods: {
    // Получение rgb
    getRGB(color) {
      return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    },
    // Получение XYZ
    getXYZ(color) {
      let r = color[0]
      let g = color[1]
      let b = color[2]
      let _r = r / 255
      let _g = g / 255
      let _b = b / 255

      // Применяем коррекцию гамма-компрессии sRGB
      _r = _r > 0.04045 ? Math.pow((_r + 0.055) / 1.055, 2.4) : _r / 12.92
      _g = _g > 0.04045 ? Math.pow((_g + 0.055) / 1.055, 2.4) : _g / 12.92
      _b = _b > 0.04045 ? Math.pow((_b + 0.055) / 1.055, 2.4) : _b / 12.92

      _r *= 100
      _g *= 100
      _b *= 100

      // Коэффициенты преобразования RGB в XYZ
      let x =
        Math.round((_r * 0.4124564 + _g * 0.3575761 + _b * 0.1804375) * 10) / 10
      let y =
        Math.round((_r * 0.2126729 + _g * 0.7151522 + _b * 0.072175) * 10) / 10
      let z =
        Math.round((_r * 0.0193339 + _g * 0.119192 + _b * 0.9503041) * 10) / 10

      return `${x}, ${y}, ${z}`
    },
    getLab(color) {
      const [x, y, z] = this.getXYZ(color).split(', ')

      // Коэффициенты для преобразования
      const xn = 95.047
      const yn = 100.0
      const zn = 108.883

      const fx = x / xn
      const fy = y / yn
      const fz = z / zn

      const epsilon = 0.008856
      const kappa = 903.3

      const f = (t) =>
        t > epsilon ? Math.pow(t, 1 / 3) : (kappa * t + 16) / 116

      const L = Math.round((116 * f(fy) - 16) * 10) / 10
      const a = Math.round(500 * (f(fx) - f(fy)) * 10) / 10
      const b = Math.round(200 * (f(fy) - f(fz)) * 10) / 10

      return `${L}, ${a}, ${b}`
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar-pixel {
  display: flex;
  flex-direction: column;
  justify-content: center;

  &__item {
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #1c1c1c;

    &:last-of-type {
      border-bottom: 0;
    }
  }

  &__color {
    width: 48px;
    height: 48px;
    border-radius: 5px;
  }

  &__option {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
