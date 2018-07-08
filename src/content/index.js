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
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import '@/content/components/admin-lite/styles/index.scss' // global css
import '@/content/components/admin-lite/icons' // icon
// import '@/content/components/admin-lite/permission' // permission control
import router from './components/admin-lite/router'
import store from './components/admin-lite/store'

Vue.use(ElementUI, { locale })

// admin-demo
/*
import router from './components/admin/router'
import store from './components/admin/store'

import i18n from './components/admin/lang' // Internationalization
import './components/admin/icons' // icon
import './components/admin/errorLog'// error log
import './components/admin/permission' // permission control
import './components/admin/mock' // simulation data

import * as filters from './components/admin/filters' // global filters

Vue.use(ElementUI, {
  size: 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

*/

Vue.use(vOutsideEvents)

Vue.config.productionTip = false

router.beforeEach(function (to, from, next) {
  console.log('router.beforeEach.to: ', to)
  console.log('router.beforeEach.from: ', from)
  next()
})

router.afterEach(function (a) {
  console.log('router.afterEach: ', a)
})

// used in Vue rendering
Vue.prototype.__ = chrome.i18n.getMessage

const sidePanel = document.createElement('div')
sidePanel.setAttribute('id', 'snk-content')
document.body.appendChild(sidePanel)

Vue.config.productionTip = false

new Vue({
  el: '#snk-content',
  router,
  store,
  // admin-demo
  // i18n,
  render: h => h(Content)
})

console.log('[chrome-ext] - content initialized...')
