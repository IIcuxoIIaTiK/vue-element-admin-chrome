const gateway = {
  state: {
    config: {
      statusMap: true
    }
  },
  mutations: {
    STATUS_MAPPING: (state, status) => {
      state.statusMap = status
    }
  },
  actions: {
    statusMapping ({ commit }, status) {
      commit('STATUS_MAPPING', status)
    }
  }
}

export default gateway
