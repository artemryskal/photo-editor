<template>
  <div class="d-flex align-center justify-center flex-column flex-grow-1">
    <!-- Кнопка загрузить -->
    <v-btn color="primary" variant="tonal" @click="$refs.uploader.click()">
      Загрузить файл
      <v-icon #append-icon icon="fa-solid fa-upload" size="12" class="ml-2" />
    </v-btn>

    <p class="my-3">или</p>

    <!-- Форма загрузки изображения по ссылке -->
    <form
      class="d-flex flex-column align-center"
      @submit.prevent="uploadFromLink">
      <v-text-field
        v-model.trim="url"
        placeholder="Вставьте url изображения"
        hide-details />
      <v-btn type="submit" variant="outlined" color="primary" class="mt-3">
        Скачать
      </v-btn>
    </form>

    <!-- Инпут для загрузки файла -->
    <input type="file" ref="uploader" class="d-none" @change="uploadImage" />
  </div>
</template>

<script setup>
const canvasStore = useCanvasStore()
const url = ref('')

// Метод загрузки файла
const uploadImage = (e) => {
  if (!e.target.files.length) return false
  const img = new Image()
  img.src = URL.createObjectURL(e.target.files[0])
  img.crossOrigin = 'anonymous'
  canvasStore.img = img
  canvasStore.event = true
}

// Метод загрузки файла по url
const uploadFromLink = async () => {
  try {
    const res = await canvasStore.getByUrl(url.value)
    const img = new Image()
    img.src = URL.createObjectURL(res)
    img.crossOrigin = 'anonymous'
    canvasStore.img = img
    canvasStore.event = true
  } catch (e) {
    notify({
      title: 'Ошибка',
      text: e.message,
      type: 'error',
    })
  }
}
</script>
