import Vue from 'vue'

import App from './root.vue' // option app-main page
import router from '@/extension/popup/router/index.js' // custom router
import store from '@/components/admin-lite/store'
// import '@/permission' // permission control

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import i18n from './lang' // Internationalization
import '@/extension/popup/icons' // icon
import './errorLog'// error log

import * as filters from './filters' // global filters
Vue.use(ElementUI, { locale })

/*
router.beforeEach(function (to, from, next) {
  console.log('router.beforeEach.to: ', to)
  console.log('router.beforeEach.from: ', from)
  next()
})

router.afterEach(function (a) {
  console.log('router.afterEach: ', a)
})
*/

// Clear after module reload
window.addEventListener('message', e => {
  // if ('production' !== process.env.NODE_ENV) {
  // console.clear()
  // console.log('[chrome-ext-popup] - console.clear() from \'message\' event: ')
  // }
})

const snkOpts = document.createElement('div')
snkOpts.setAttribute('id', 'app')
document.body.appendChild(snkOpts)

/*
Vue.use(ElementUI, {
  size: 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})
*/

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
