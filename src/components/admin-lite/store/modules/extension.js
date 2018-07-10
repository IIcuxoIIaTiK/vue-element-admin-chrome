const extension = {
  state: {
    enabled: true
  },
  mutations: {
    SET_STATUS: (state, status) => {
      state.enabled = status
    }
  },
  actions: {
    setStatus ({ commit }, status) {
      commit('SET_STATUS', status)
    }
  }
}

export default extension
