import Vue from 'vue'
import Vuex from 'vuex'

import modalsStore from './modules/modals'
import editorStore from './modules/editor'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    modalsStore,
    editorStore,
  },
})

export default store
