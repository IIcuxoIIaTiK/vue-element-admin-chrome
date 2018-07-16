// global - components
import Vue from 'vue'

// external - components
// --> https://github.com/nchutchind/vue-outside-events
import vOutsideEvents from 'vue-outside-events'

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import Content from './content.vue'

import locale from 'element-ui/lib/locale/lang/en' // lang i18n

// import '@/components/admin-lite/styles/index.scss' // global css
// import '@/components/admin-lite/icons' // icon

// import '@/components/admin-lite/permission' // permission control
import router from '@/components/admin-lite/router'
import store from '@/components/admin-lite/store'

import ElSearchTablePagination from 'el-search-table-pagination'

Vue.config.productionTip = false

// Default use axios as HTTP tool
Vue.use(ElSearchTablePagination)

Vue.use(ElementUI, { locale })
Vue.use(vOutsideEvents)

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

new Vue({
  el: '#snk-content',
  router,
  store,
  render: h => h(Content)
})

console.log('[chrome-ext] - content initialized...')
