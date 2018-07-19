// global - components
import Vue from 'vue'

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import 'element-ui/lib/theme-chalk/index.css'
import '@/components/admin-lite/styles/index.scss' // local css
import '@/components/admin-lite/icons' // icon

import Content from './content.vue'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

// import '@/components/admin-lite/permission' // permission control

import router from '@/components/admin-lite/router'
import store from '@/components/admin-lite/store'
// import extConfig from '@/components/Config/ExtConfig'

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

// import ErrorPage from 'vue-error-page'
// import vRouterStorage from 'vue-router-storage'

// A Vue js Global Event Bus plugin using the power of Observable
// --> https://github.com/vouill/vue-geb
// --> https://github.com/vouill/vue-geb-example/blob/master/src/App.vue
// import Geb from 'vue-geb'

// Vue plugin for work with local storage, session storage and memory storage from Vue context
// --> https://github.com/RobinCK/vue-ls
// import vStorage from 'vue-ls'

// Vue and Vuex plugin to persistence data with localStorage/sessionStorage
// Multiple storage, Vuex, Vuex modules, Nested key
// --> https://github.com/maple3142/vuejs-storage
// import vuejsStorage from 'vuejs-storage'

// Vue.js v2.x plugin for localStorage and sessionStorage (~1.7kb min+gz)
// --> https://github.com/ankurk91/vue-web-storage
//
// Features:
// - Choose either localStorage or sessionStorage
// - Prefix all of your stored keys
// - Auto JSON.stringify and JSON.parse
// - Events for cross tab communication
// import vWebStorage from 'vue-web-storage'

// --> https://github.com/choufeng/vue-ramda
// import VueRamda from 'vue-ramda'

// --> https://github.com/estudioliver/vue-uuid
// import uuid from '@estudioliver/vue-uuid-v4'

// --> https://github.com/anthonygore/vue-router-user-roles
// import VueRouterUserRoles from "vue-router-user-roles";

// Vue.use(VueRouterUserRoles, { router })

// --> https://github.com/ktquez/vue-disqus
// import VueDisqus from 'vue-disqus'

// --> https://github.com/nicolasbeauvais/vue-add-to-calendar
// import AddToCalendar from 'vue-add-to-calendar'

// --> https://github.com/israelss/vue-worker
// import VueWorker from 'vue-worker'

// --> https://github.com/karol-f/vue-custom-element
// import vueCustomElement from 'vue-custom-element'

// --> https://github.com/alex-oleshkevich/vue-introjs
// import VueIntro from 'vue-introjs'

// --> https://github.com/cklmercer/vue-events
// import VueEvents from 'vue-events'
// Vue.use(VueEvents)

// --> https://github.com/encyjs/vuency
// import Vuency from 'vuency'

// --> https://github.com/jpex-js/vue-inject
// import injector from 'vue-inject'

// --> https://github.com/Ewocker/vue-lodash
// import VueLodash from 'vue-lodash'

// Vue.use(injector)
// Vue.use(Vuency)
// Vue.use(VueIntro)
// Vue.use(vueCustomElement)
// Vue.use(AddToCalendar)
// Vue.use(VueWorker, '$snk-worker')
// Vue.use(VueDisqus)

// Vue.use(uuid)

// Vue.use(VueRamda)

/*
Vue.use(vWebStorage, {
  prefix: 'snk_web_', // default `app_`
  driver: 'local' // default 'local', 'local' or 'session'
})

Vue.$vWebStorage.set('name', 'john')
Vue.$vWebStorage.set('isAdmin', true)
Vue.$vWebStorage.set('roles', ['admin', 'sub-admin'])
Vue.$vWebStorage.set('permission', {id: 2, slug: 'edit_post'})
console.log('Vue.$vWebStorage: ', Vue.$storage.keys())
Vue.use(Geb)

const localStoreOpts = {
  namespace: 'snk__', // key prefix
  name: 'ls', // name variable Vue.[ls] or this.[$ls],
  storage: 'local' // storage name session, local, memory
}

Vue.use(vStorage, localStoreOpts)

Vue.use(vuejsStorage)
*/

// ref: https://github.com/edgarnadal/vue-tidyroutes
// import VueRouter from 'vue-router'
// import VueTidyRoutes from 'vue-tidyroutes'

/*
Vue.use(Vuec)
Vue.$ioc.register('ElSearchTablePagination', ElSearchTablePagination)
Vue.$ioc.register('OutsideEvents', OutsideEvents)

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
*/

Vue.config.productionTip = false

// Default use axios as HTTP tool
Vue.use(ElSearchTablePagination)

Vue.use(ElementUI, { locale })
Vue.use(vOutsideEvents)

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
