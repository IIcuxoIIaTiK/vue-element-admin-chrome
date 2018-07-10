import Cookies from 'js-cookie'

const app = {
  state: {
    debug: true,
    verbose: true,
    extension: {
      resizedWidth: !+Cookies.get('extensionResizedWidth'),
      containerWidth: !+Cookies.get('extensionContainerWidth'),
      delayAnimation: !+Cookies.get('extensionDelayAnim'),
      withoutAnimation: false
    },
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    language: Cookies.get('language') || 'en'
  },
  mutations: {
    RESIZE_EXTENSION: (state, resizedWidth) => {
      if (resizedWidth > 0) {
        Cookies.set('extensionResizedWidth', resizedWidth)
      } else {
        Cookies.set('extensionResizedWidth', 550)
      }
      state.extension.resizedWidth = !+Cookies.get('extensionResizedWidth')
      state.extension.withoutAnimation = false
      state.extension.delayAnimation = '.5s'
    },
    RESIZE_CONTAINER: (state, containerWidth) => {
      if (containerWidth > 0) {
        Cookies.set('extensionContainerWidth', containerWidth)
      } else {
        Cookies.set('extensionContainerWidth', 950)
      }
      state.extension.containerWidth = !+Cookies.get('extensionContainerWidth')
      state.extension.withoutAnimation = false
      state.extension.delayAnimation = '.5s'
    },
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.set('language', language)
    }
  },
  actions: {
    ResizeExtension ({commit}, { resizedWidth }) {
      commit('RESIZE_EXTENSION', resizedWidth)
    },
    ResizeContainer ({commit}, { containerWidth }) {
      commit('RESIZE_CONTAINER', containerWidth)
    },
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar ({commit}, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice ({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    SetLanguage ({ commit }, language) {
      commit('SET_LANGUAGE', language)
    }
  }
}

export default app
