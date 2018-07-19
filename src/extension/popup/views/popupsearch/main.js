import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue from 'vue'
import Content from './index.vue'
// import store from '/extension/popup/widgets/popusearch/store'
// import router from '@/extension/popup/widgets/popusearch/router'

import fontawesome from '@fortawesome/fontawesome'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'
import faArrowRight from '@fortawesome/fontawesome-free-solid/faArrowRight'
import faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft'
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH'
import faSort from '@fortawesome/fontawesome-free-solid/faSort'
import faSortDown from '@fortawesome/fontawesome-free-solid/faSortDown'
import faSortUp from '@fortawesome/fontawesome-free-solid/faSortUp'
import Datatable from 'vue2-datatable-component'

if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true
}

fontawesome.library.add(faSearch)
fontawesome.library.add(faArrowRight)
fontawesome.library.add(faEllipsisH)
fontawesome.library.add(faSort)
fontawesome.library.add(faSortDown)
fontawesome.library.add(faSortUp)
fontawesome.library.add(faArrowLeft)
window.store = store

Vue.use(Datatable);

export default function install (Vue) {
  Vue.component('SnkPopupSearch', Content)
}

// auto install
if (typeof window !== 'undefined' && typeof window.Vue !== 'undefined') {
  window.Vue.use(install)
}


/*
// eslint-disable no-new
window.App = new Vue({
  el: '#app',
  store,
  router,
  render: h => h(Content)
});
*/