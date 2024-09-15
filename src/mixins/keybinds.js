export default {
  computed: {
    ...mapState({
      ready: (s) => s.editorStore.ready,
    }),
  },
  mounted() {
    document.body.addEventListener('keydown', this.activateTool)
  },
  methods: {
    ...mapMutations({
      setActiveTool: 'editorStore/setActiveTool',
    }),
    activateTool(e) {
      // Проверяем, не вводит ли пользователь текст в поле input или textarea
      const activeElement = document.activeElement
      const isInputActive =
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA'

      // Если активен input или textarea, не выполняем логику
      if (isInputActive || !this.ready) return false

      const letter = e.key.toLowerCase()
      if (letter === 'p') this.setActiveTool('pipette')
      else if (letter === 'm') this.setActiveTool('move')
    },
  },
}
