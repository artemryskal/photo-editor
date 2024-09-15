<template>
  <v-dialog v-model="show" max-width="400" persistent>
    <v-card>
      <h3 class="mb-4">Загрузите файл</h3>
      <!-- Загрузка по ссылке -->
      <v-text-field
        v-model="url"
        label="Загрузка по ссылке"
        hide-details
        class="mb-4" />

      <!-- Загрузка файла -->
      <v-file-input
        v-model="file"
        counter
        label="Загрузите изображение"
        placeholder="Выберите изображение"
        prepend-icon="mdi-image"
        outlined
        hide-details
        class="mb-4" />

      <!-- Кнопка загрузить -->
      <v-btn
        color="primary"
        :disabled="disabledUpload"
        :loading="loading"
        @click="submit">
        Загрузить
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script>
import modalsMixin from '@/mixins/modals'

export default {
  name: 'ModalsUpload',
  mixins: [modalsMixin],
  data() {
    return {
      url: 'https://i0.wp.com/4kmems.ch/wp-content/uploads/2022/09/placeholder-1.png?ssl=1',
      file: null,
      loading: false,
    }
  },
  computed: {
    disabledUpload() {
      if (!this.url && !this.file) return true
      return false
    },
  },
  methods: {
    ...mapMutations({
      setImage: 'editorStore/setImage',
    }),
    // Обработчик кнопки "Загрузить"
    async submit() {
      this.loading = true
      if (this.url) await this.downloadImage()
      else this.uploadImage()
      this.loading = false
      this.show = false
    },
    // Скачивание по ссылке
    async downloadImage() {
      try {
        const data = await fetch(this.url)
        const blob = await data.blob()
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = URL.createObjectURL(blob)
        image.onload = () => {
          this.setImage(image)
        }
      } catch (e) {
        this.$notify({
          type: 'error',
          title: 'Ошибка',
          text: 'Ошибка при загрузке изображения по ссылке',
        })
      }
    },
    // Загрузка файла
    uploadImage() {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = URL.createObjectURL(this.file)
      image.onload = () => {
        this.setImage(image)
      }
    },
  },
}
</script>
