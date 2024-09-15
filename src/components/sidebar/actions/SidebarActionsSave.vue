<template>
  <div>
    <v-btn elevation="0" @click="save">
      <v-icon size="20">mdi-content-save</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SidebarActionsSave',
  computed: {
    ...mapState({
      image: (s) => s.editorStore.image,
      result: (s) => s.editorStore.result,
      canvas: (s) => s.editorStore.canvas,
      resultData: (s) => s.editorStore.result,
    }),
  },
  methods: {
    save() {
      const helper = document.createElement('canvas')
      const ctxHelper = helper.getContext('2d')

      helper.width = this.result.width
      helper.height = this.result.height
      ctxHelper.drawImage(
        this.image,
        0,
        0,
        this.result.width,
        this.result.height
      )
      const data = helper.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = data
      link.download = 'photo.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
  },
}
</script>
