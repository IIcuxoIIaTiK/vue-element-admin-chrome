// global - components
import Vue from 'vue'

import ElementUI from 'element-ui'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import 'element-ui/lib/theme-chalk/index.css'
import '@/components/admin-lite/styles/index.scss' // local css
import '@/components/admin-lite/icons' // icon

import Content from './root.vue'

import locale from 'element-ui/lib/locale/lang/en' // lang i18n

// import '@/components/admin-lite/permission' // permission control
import router from '@/components/admin-lite/router'
import store from '@/components/admin-lite/store'
import appConfig from '@/components/Config/AppConfig'

/*
  To master:
  - https://vuejs.org/v2/guide/mixins.html
  - https://vuejs.org/v2/guide/plugins.html
*/

// external - components
// --> https://github.com/nchutchind/vue-outside-events
import Vuec from 'vue-container'
import Axios from 'axios'
import vOutsideEvents from 'vue-outside-events'
import ElSearchTablePagination from 'el-search-table-pagination'
import ErrorPage from 'vue-error-page'
import vRouterStorage from 'vue-router-storage'
import VueConfig from 'vue-configuration'

// ref: https://github.com/edgarnadal/vue-tidyroutes
// import VueRouter from 'vue-router'
// import VueTidyRoutes from 'vue-tidyroutes'

/*
Vue.use(Vuec)
Vue.$ioc.register('ElSearchTablePagination', ElSearchTablePagination)
Vue.$ioc.register('OutsideEvents', OutsideEvents)
*/

// Clear after module reload
window.addEventListener('message', e => {
  // if ('production' !== process.env.NODE_ENV) {
  // console.clear()
  // console.log('[chrome-web] - console.clear() from \'message\' event.')
  // }
})

// pass config object to the plugin
Vue.use(VueConfig, {
  config: appConfig
})

// Vue Container
Vue.use(Vuec, {
  register: {
    $http: Axios,
    $tablePaginate: ElSearchTablePagination,
    $outsideEvents: vOutsideEvents,
    $error404: ErrorPage
  }
})

//showLog: Print Internal log (default: false) stayHere: Limit not to exit Vue application (default true)
//instanceName: the name of the history instance object,which can be change when get conflict whit other plugin
Vue.use(vRouterStorage, {
  showLog: true,
  stayHere: true,
  instanceName: '$history'
})

// Vue error
Vue.use(ErrorPage, {
  resolver: (component) => {
    return component
  },
  tagName: 'app-view',
  bus: 'eventBus',
  event: 'error-page'
})

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
// Vue.prototype.__ = chrome.i18n.getMessage

const sidePanel = document.createElement('div')
sidePanel.setAttribute('id', 'snk-content')
document.body.appendChild(sidePanel)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(Content)
})

console.log('[chrome-web] - content initialized...')
