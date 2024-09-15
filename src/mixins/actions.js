export default {
  computed: {
    ...mapState({
      activeTool: (s) => s.editorStore.activeTool,
    }),
    color() {
      if (this.activeTool !== this.toolName) return ''
      return 'primary'
    },
  },
  methods: {
    ...mapMutations({
      setActiveTool: 'editorStore/setActiveTool',
      clearDetails: 'editorStore/clearDetails',
    }),
    toggleTool() {
      this.clearDetails()
      if (this.activeTool !== this.toolName)
        return this.setActiveTool(this.toolName)
      this.setActiveTool('')
    },
  },
}
