// global - components
import Vue from 'vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import Content from './root.vue'

import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import '@/components/admin-lite/styles/index.scss' // global css
import '@/components/admin-lite/icons' // icon

// import '@/components/admin-lite/permission' // permission control
import router from '@/components/admin-lite/router'
import store from '@/components/admin-lite/store'

import ElSearchTablePagination from 'el-search-table-pagination'

Vue.config.productionTip = false

// Default use axios as HTTP tool
Vue.use(ElSearchTablePagination)

Vue.use(ElementUI, { locale })

router.beforeEach(function (to, from, next) {
  console.log('router.beforeEach.to: ', to)
  console.log('router.beforeEach.from: ', from)
  next()
})

router.afterEach(function (a) {
  console.log('router.afterEach: ', a)
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(Content)
})

console.log('[web-app] - initialized...')
