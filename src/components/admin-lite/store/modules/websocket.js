const ws = {
  state: {
    socket: {
      isConnected: false,
      message: '',
      reconnectError: false
    }
  },
  mutations: {
    SOCKET_ONOPEN: (state, event) => {
      state.socket.isConnected = true
    },
    SOCKET_ONCLOSE: (state, event) => {
      state.socket.isConnected = false
    },
    SOCKET_ONERROR: (state, event) => {
      console.error(state, event)
    },
    // default handler called for all methods
    SOCKET_ONMESSAGE: (state, message) => {
      state.socket.message = message
    },
    // mutations for reconnect methods
    SOCKET_RECONNECT: (state, count) => {
      console.info(state, count)
    },
    SOCKET_RECONNECT_ERROR: (state) => {
      state.socket.reconnectError = true
    }
  },
  actions: {
    OnOpen ({commit}, { event }) {
      commit('SOCKET_ONOPEN', event)
    },
    OnClose ({commit}, { event }) {
      commit('SOCKET_ONCLOSE', event)
    },
    OnError ({commit}, { event }) {
      commit('SOCKET_ONERROR', event)
    },
    OnMessage ({commit}, { message }) {
      commit('SOCKET_ONMESSAGE', message)
    },
    OnReconnect ({ commit }, { count }) {
      commit('SOCKET_RECONNECT', count)
    },
    OnReconnectError ({ commit }) {
      commit('SOCKET_RECONNECT_ERROR')
    }
  }
}

export default ws
