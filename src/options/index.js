import Vue from 'vue'
import App from './root.vue'

Vue.config.productionTip = false
// used in Vue rendering
// Vue.prototype.__ = chrome.i18n.getMessage

new Vue({
  el: '#app',
  render: h => h(App)
})
