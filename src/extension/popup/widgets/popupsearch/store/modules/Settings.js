import _ from 'lodash'

const state = {
  settings: {
    searchEngine: 'googleHTML',
    acSource: 'google',
    closeAfterLink: false,
    focusInputKey: 'Ctrl+e',
    toggleHistoryKey: 'Ctrl+h',
    focusInputAltKey: 'Tab',
    clearInputKey: 'Ctrl+u',
    jumpTopKey: 'Shift+g',
    jumpBottomKey: 'g g',
    scrollUpKey: 'k',
    scrollDownKey: 'j',
    openBgTabModifier: 'Shift',
    openActTabModifier: '',
    openCurTabModifier: 'Ctrl',
    lastDaysToRemember: 10
  },
  keyModifierList: ['Ctrl', 'Shift', 'Alt', '']
}

const getters = {}

const mutations = {
  setSettings (state, newSettings) {
    state.settings = _.extend(state.settings, newSettings)
  },
  setProp (state, {prop, val}) {
    state.settings[prop] = val
  }
}

// Promise constructor parameters must be named resolve, reject
const actions = {
  load ({commit, state}) {
    let loadPromise = new Promise((resolve, reject) => {
      chrome.storage.local.get(state.settings, (items) => {
        commit('setSettings', items)
        resolve(items)
      })
    })
    return loadPromise
    /*
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(state.settings, (items) => {
        const error = chrome.runtime.lastError
        if (error) {
          reject(error)
        } else {
          commit('setSettings', items)
          resolve(items)
        }
      })
    })
    */
    /*
    return Promise.all([new Promise(resolveFn => {
      chrome.storage.local.get(state.settings, (items) => {
        commit('setSettings', items)
        resolveFn()
      })
    })])
    */
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
