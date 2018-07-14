/**
 * vuex store
 * Mainly used to temporarily store the value of the setting item
 * Used for inter-component communication to notify component changes in a timely manner
 */
import Vue from 'vue'
import Vuex from 'vuex'
import * as Setting from '../api/setting.js'
import * as BingAPI from '../api/bing.js'

const state = {
  featrues: null, // application bookmark lovasites  application{ name "application", status true, storeKey "SETTING_APPLICATION"}
  bing: null, // Bing background setting item {name: "bing", status: false}
  color: null // Solid background set #987a3b
}

/**
 * Initialization data
 */
Setting.fetchFeatures.then(data => {
  state.featrues = data
})

Setting.fetchBing.then(data => {
  state.bing = data
})

Setting.fetchColor.then(data => {
  state.color = data
})

// getters
const getters = {
  featrues: state => state.featrues,
  application: state => state.featrues ? state.featrues.application : null, // 防止空值异常
  bookmark: state => state.featrues ? state.featrues.bookmark : null,
  commonsites: state => state.featrues ? state.featrues.commonsites : null,
  bing: state => state.bing,
  color: state => state.color
}

// Type of mutation
const types = {
  SET_BING_STATUS: 'SET_BING_STATUS',
  SET_BING_INITAL: 'SET_BING_INITAL',
  SET_FEATRUES_VALUE: 'SET_FEATRUES_VALUE',
  SET_COLOR: 'SET_COLOR'
}

// mutation
const mutations = {
  // Turn on/off Bing background image
  [types.SET_BING_STATUS] (state, status) {
    state.bing.status = status
  },
  [types.SET_BING_INITAL] (state, val) {
    state.bing.inital = val
  },
  // Turn Features settings on/off
  [types.SET_FEATRUES_VALUE] (state, {type, status}) {
    state.featrues[type].status = status
  },
  // Set color value
  [types.SET_COLOR] (state, value) {
    state.color = value
  }
}

const actions = {
  /**
   * Edit features
   * @param {String} type [application/bookmark/setting]
   * @param {Boolean} status
   */
  modifyFeatrues ({ commit, state }, {type, status}) {
    // Modify the value of vuex
    commit(types.SET_FEATRUES_VALUE, { type, status })
    // Store new data
    Setting.modify(type, status)
  },
  /*
  * Modify Bing background image
  * @param {Boolean} status
  */
  modifyBackground ({ commit, state }, image) {
    // Modify the value of vuex
    commit(types.SET_BING_STATUS, true)
    commit(types.SET_BING_INITAL, false)
    // local store
    BingAPI.saveBackground(image)
    // Store new data
    Setting.modify('bing', true)
  },
  modifyBackgroundVisible ({ commit, state }, status) {
    commit(types.SET_BING_STATUS, status)
    // Store new data
    Setting.modify('bing', status)
  },
  // Set the background color
  modifyColor ({ commit, state }, value) {
    // Modify the value of vuex
    commit(types.SET_COLOR, value)
    // Also update bing set to invisible
    commit(types.SET_BING_STATUS, false)
    // Store new data
    Setting.setColor(value)
    // Store new data
    Setting.modify('bing', false)
  }
}

// Vuex component
Vue.use(Vuex)

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
