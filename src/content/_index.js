// global - components
import Vue from 'vue'

// external - components
// --> https://github.com/nchutchind/vue-outside-events
import vOutsideEvents from 'vue-outside-events'

// --> element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import Content from './App.vue'

// admin-lite - components
import vAdminElement from './components/admin-lite/index'

Vue.use(ElementUI, { locale })
Vue.use(vOutsideEvents)
Vue.use(vAdminElement)

Vue.config.productionTip = false

// used in Vue rendering
Vue.prototype.__ = chrome.i18n.getMessage

const sidePanel = document.createElement('div')
sidePanel.setAttribute('id', 'snk-content')
document.body.appendChild(sidePanel)

Vue.config.productionTip = false

new Vue({
  el: '#snk-content',
  vAdminElement,
  render: h => h(Content)
})

console.log('[chrome-ext] - content initialized...')
