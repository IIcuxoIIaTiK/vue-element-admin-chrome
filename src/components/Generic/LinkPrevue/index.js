import Vue from 'vue'
import Content from './content.vue'

new Vue({
  el: '#link-preview',
  template: '<LinkPrevue>',
  render: h => h(Content)
})
