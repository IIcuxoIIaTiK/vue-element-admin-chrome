import Vue from 'vue'
import root from './root.vue'

Vue.config.productionTip = false

// import AdminTab from '@/content/components/admin/main'

/* eslint-disable no-new */
new Vue({
  el: '#root',
  // AdminTab,
  render: h => h(root)
})

console.log('This is TAB page!')
