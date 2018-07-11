import Vue from 'vue'
import root from './root.vue'

// import SnkTab from './snk/root.vue'
// import MinoTab from './mino/root.vue'
import SnkWhatDidYouDoTab from './wdydt/root.vue'

Vue.config.productionTip = false

const snkTab = document.createElement('div')
snkTab.setAttribute('id', 'app')
document.body.appendChild(snkTab)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  SnkWhatDidYouDoTab,
  // SnkMinoTab,
  // SnkTab,
  render: h => h(root)
})

console.log('[chrome-ext] - tab initialized...')
