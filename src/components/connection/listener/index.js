import Vue from 'Vue'
import bus from './bus' // Event bus instance

Vue.prototype.$bus = bus // Optional (but convenient)

import VueConnectionListener from 'vue-connection-listener'
const connectionListener = new VueConnectionListener(bus) // Create instance (injecting our bus)

new Vue({
  el: '#app',
  render: h => h(App),
  created() {
    connectionListener.register()
  },
  destroyed() {
    connectionListener.unregister()
  }
})
