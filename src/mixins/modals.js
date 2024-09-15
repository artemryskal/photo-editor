export default {
  computed: {
    ...mapState({
      modal: (s) => s.modalsStore.modal,
    }),
    show: {
      get() {
        return this.modal === this.$options.name
      },
      set() {
        this.setModal('')
      },
    },
  },
  methods: {
    ...mapMutations({
      setModal: 'modalsStore/setModal',
    }),
  },
}
