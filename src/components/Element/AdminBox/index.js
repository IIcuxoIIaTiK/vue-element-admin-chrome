import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/components/admin-lite/styles/index.scss' // global css

import Content from './root'
import router from './router'
import store from './store'

import '@/components/admin-lite/icons' // icon
// import '@/components/admin-lite/permission' // permission control

Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

router.beforeEach(function (to, from, next) {
  console.log('router.beforeEach.to: ', to)
  console.log('router.beforeEach.from: ', from)
  next()
})

router.afterEach(function (a) {
  console.log('router.afterEach: ', a)
})

const VueAdminLite = new Vue({
  el: '#admin',
  router,
  store,
  render: h => h(Content)
})

export default VueAdminLite
