const bookmarks = {
  state: {
    enabled: true
  },
  mutations: {
    SET_BOOKMARKS: (state, status) => {
      state.enabled = status
    }
  },
  actions: {
    setBookmarks ({ commit }, status) {
      commit('SET_BOOKMARKS', status)
    }
  }
}

export default bookmarks
