import * as Api from '../../api/topsites.js'

const topSites = {
  state: {
    sites: [],
    config: false
  },
  mutations: {
    SET_SITES (state, data) {
      state.sites = data
    },
    SET_SITE (state, data) {
      state.sites[data.index][data.field] = data.value
    },
    SET_CONFIG (state, data) {
      state.config = data
    }
  },
  actions: {
    async init ({commit}) {
      const data = await Api.getTopSites()
      commit('SET_SITES', data)
    },
    set_site ({commit}, data) {
      commit('SET_SITE', data)
      Api.saveTopSites(JSON.parse(JSON.stringify(this.state.sites)))
    },
    set_config ({commit}, data) {
      commit('SET_CONFIG', data)
    }
  }
}

export default topSites
