import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import ws from './modules/websocket'
import ext from './modules/extension'
import gateway from './modules/gateway'
import errorLog from './modules/errorLog'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import user from './modules/user'
import getters from './getters'

// import { gebHandler } from 'vue-geb'

// --> https://github.com/bazzite/vue-warehouse
// --> https://github.com/bazzite/vue-warehouse/blob/develop/examples/vuex-synchronization/app.js
// import VueWarehouse from 'vue-warehouse'
// import VueWarehouseSync from 'vue-warehouse/sync'
// import VueWarehouseStore from 'vue-warehouse/store' // vue-warehouse store instance

Vue.use(Vuex)

// --> https://github.com/bazzite/vue-warehouse
// Vue.use(VueWarehouse, {
//  store: VueWarehouseStore
// })

/*
const actions = {
  open_modal: ({commit}, payload) => {
    gebHandler.emit(payload)
  }
}
*/

/*
// --> https://github.com/maple3142/vuejs-storage#usage
import vuejsStorage from 'vuejs-storage'
const vuejsStorage = new Vuex.Store({
  //state...
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  plugins: [
    vuejsStorage({
      keys: ['count'],
      //keep state.count in localStorage
      namespace: 'my-namespace',
      driver: vuejsStorage.drivers.sessionStorage
      //if you want to use sessionStorage instead of localStorage
    })
  ]
})
*/

const store = new Vuex.Store({
  modules: {
    app,
    errorLog,
    permission,
    tagsView,
    user,
    // actions,
    ext,
    gateway,
    ws
  },
  getters
})

// VueWarehouseSync(store, VueWarehouseStore)

export default store
