// global - components
import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/components/admin-lite/styles/index.scss' // global css

import Content from './root.vue'
import router from './router'
import store from '@/components/admin-lite/store'

import '@/components/admin-lite/icons' // icon

Vue.use(ElementUI, { locale })

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

Vue.config.productionTip = false

const sidePanel = document.createElement('div')
sidePanel.setAttribute('id', 'snk-opts')
document.body.appendChild(sidePanel)

new Vue({
  el: '#snk-opts',
  router,
  store,
  render: h => h(Content)
})

console.log('[chrome-ext] - options admin initialized...')
