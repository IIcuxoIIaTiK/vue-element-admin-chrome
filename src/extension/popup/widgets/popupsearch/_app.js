import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue from 'vue'
// import App from './App'
import Content from '@/extension/popup/widgets/popupsearch/root.vue'

import router from '@/extension/popup/widgets/popupsearch/router'
import store from '@/extension/popup/widgets/popupsearch/store'
// import store from './store'
// import router from './router'

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

// window.store = store

Vue.use(Datatable)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(Content)
})
