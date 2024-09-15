const state = () => ({
  modal: 'ModalsUpload',
})

const getters = {}

const mutations = {
  setModal(state, payload) {
    state.modal = payload
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
