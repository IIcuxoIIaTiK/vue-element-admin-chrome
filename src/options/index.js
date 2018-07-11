import Vue from 'vue'

import App from './root.vue' // option app-main page
import router from './router' // custom router
import store from '@/components/admin-lite/store'
// import '@/permission' // permission control

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

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

const snkOpts = document.createElement('div')
snkOpts.setAttribute('id', 'app')
document.body.appendChild(snkOpts)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
