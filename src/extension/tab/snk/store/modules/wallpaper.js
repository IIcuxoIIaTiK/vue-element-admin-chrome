const wallpaper = {
  state: {
    enabled: true
  },
  mutations: {
    SET_WALLPAPER: (state, status) => {
      state.enabled = status
    }
  },
  actions: {
    setWallPaper ({ commit }, status) {
      commit('SET_WALLPAPER', status)
    }
  }
}

export default wallpaper
