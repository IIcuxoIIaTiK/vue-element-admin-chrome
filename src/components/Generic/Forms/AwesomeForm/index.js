import Vue from 'vue'
import SchemaForm from 'vue-awesome-form'
import '@vue-awesome-form/dist/main.css'

import Content from './content.vue'

Vue.config.productionTip = false

Vue.component('schema-form', SchemaForm)

/* eslint-disable no-new */
new Vue({
  el: '#awe-form',
  components: { Content },
  template: '<AwesomeForm/>'
})
