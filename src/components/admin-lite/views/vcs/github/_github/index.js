import Vue from 'vue'
import Content from './content.vue'

import store from '@/components/admin-lite/store'

new Vue({
  el: '#gh-search-results',
  store,
  render: h => h(Content)
})
