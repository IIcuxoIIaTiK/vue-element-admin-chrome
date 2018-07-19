import Vue from 'vue'

////////////////////////////////////////////////
// vue-element-admin
////////////////////////////////////////////////

// import Content from './root.vue' // option app-main page
// import router from '@/components/admin-lite/router/index.js' // custom router
// import store from '@/components/admin-lite/store'
// import '@/permission' // permission control

////////////////////////////////////////////////
// popupsearch
////////////////////////////////////////////////
import Content from '@/extension/popup/widgets/popupsearch/root.vue' // option app-main page
import router from '@/extension/popup/widgets/popupsearch/router'
import store from '@/extension/popup/widgets/popupsearch/store'

// import PopupSearch from '@/extension/popup/widgets/popupsearch/index.js' // popupsearch widget
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import fontawesome from '@fortawesome/fontawesome'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'
import faArrowRight from '@fortawesome/fontawesome-free-solid/faArrowRight'
import faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft'
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH'
import faSort from '@fortawesome/fontawesome-free-solid/faSort'
import faSortDown from '@fortawesome/fontawesome-free-solid/faSortDown'
import faSortUp from '@fortawesome/fontawesome-free-solid/faSortUp'
import Datatable from 'vue2-datatable-component'

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import i18n from './lang' // Internationalization
import '@/extension/popup/icons' // icon
import './errorLog'// error log

import * as filters from './filters' // global filters
Vue.use(ElementUI, { locale })

const snkOpts = document.createElement('div')
snkOpts.setAttribute('id', 'app')
document.body.appendChild(snkOpts)

/*
Vue.use(ElementUI, {
  size: 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})
*/

window.store = store

Vue.use(Datatable)

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
  render: h => h(Content)
})
