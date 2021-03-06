import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import ext from './modules/extension'
import gateway from './modules/gateway'
import errorLog from './modules/errorLog'
import permission from './modules/permission'
import tagsView from './modules/tagsView'
import user from './modules/user'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    ext,
    gateway,
    errorLog,
    permission,
    tagsView,
    user
  },
  getters
})

export default store
