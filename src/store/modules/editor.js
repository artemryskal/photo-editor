const state = () => ({
  canvas: null,
  ctx: null,
  image: null,
  result: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  details: [],
  resize: {
    type: 'pixels',
    width: 0,
    height: 0,
    ratioSave: false,
  },
  activeTool: '',
  erase: false,
  ready: false,
})

const getters = {
  // Получаем разрешение в МП
  getResolution(state) {
    return (state.result.width * state.result.height) / 1e6
  },
  // Получаем предполагаемое разрешение после масштабирования
  getResizeResolution(state) {
    // При процентном масштабировании
    if (state.resize.type === 'percent') {
      const width = Math.trunc((state.resize.width * state.result.width) / 100)
      const height = Math.trunc(
        (state.resize.height * state.result.height) / 100
      )
      return (width * height) / 1e6
    }
    return (state.resize.width * state.resize.height) / 1e6
  },
}

const mutations = {
  setCanvas(state, { canvas, ctx }) {
    state.canvas = canvas
    state.ctx = ctx
  },
  setImage(state, payload) {
    state.image = payload
    state.ready = true
  },
  setResult(state, payload) {
    Object.assign(state.result, payload)
  },
  setDetails(state, payload) {
    state.details.splice(payload.position, 1, payload)
  },
  clearDetails(state) {
    state.details = []
  },
  setResize(state, payload) {
    Object.assign(state.resize, payload)
  },
  setEraseCanvas(state, payload) {
    state.erase = payload
  },
  setActiveTool(state, payload) {
    state.activeTool = payload
  },
  clear() {
    state.image = null
    state.ready = false
  },
}

const actions = {}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
