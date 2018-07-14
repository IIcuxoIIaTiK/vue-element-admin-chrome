import Vue from 'vue'
import Content from './content.vue'
import router from './router'
import Vuetify from 'vuetify'

Vue.config.productionTip = false

Vue.use(Vuetify)

const OneTabPlus = new Vue({
  el: '#one-tab-plus',
  router,
  template: '<OneTabPlus/>',
  components: { Content }
})

// Vue.component('one-tab-plus', OneTabPlus)
