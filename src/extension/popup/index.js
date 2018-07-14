import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import Content from './root.vue'
// import OneTabPlus from '@/components/Custom/Collect/Browse/OneTabPlus/index'

import Vuetify from 'vuetify'

Vue.use(Vuetify)
Vue.use(ElementUI)

Vue.config.productionTip = false

// const root = document.createElement('div')
// document.getElementsByTagName('body')[0].appendChild(root)

/*
new Vue({
    render: (h) => h(Content)
}).$mount(root)
*/

// new Vue({ // eslint-disable-line no-new
//   el: '#root',
//   render: h => h(root)
// })

/* eslint-disable no-new */
new Vue({
  el: '#root',
  // OneTabPlus,
  render: h => h(Content)
}) //.$mount(root)
