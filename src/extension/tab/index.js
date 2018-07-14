import Vue from 'vue'

// import Content from './whymt.vue'
// import store from '@/tab/whymt/store/store.js'
import Content from './mino.vue'
import store from '@/extension/tab/mino/store'

Vue.config.productionTip = false

const snkTab = document.createElement('div')
snkTab.setAttribute('id', 'app')
document.body.appendChild(snkTab)

/* eslint-disable no-new */
new Vue({
  // el: "#root",
  store: store,
  render: h => h(Content)
}).$mount(snkTab)

console.log('[chrome-ext] - tab initialized...')
