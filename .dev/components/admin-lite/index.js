import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/content/components/admin-lite/styles/index.scss' // global css

import Content from './root'
import router from './router'
import store from './store'

import '@/content/components/admin-lite/icons' // icon
// import '@/content/components/admin-lite/permission' // permission control

Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

router.beforeEach(function (to, from, next) {
  console.log('router.beforeEach.to: ', to)
  console.log('router.beforeEach.from: ', from)
  next()
})

router.afterEach(function (a) {
  console.log('router.afterEach: ', a)
})

const VueAdminLite = new Vue({
  el: '#admin',
  router,
  store,
  render: h => h(Content)
})

/*
// This is your plugin object. It can be exported to be used anywhere.
const VueAdminLite = {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install (Vue, options) {
    Vue.component('VueAdminLite',
      new Vue({
        el: '#admin',
        router,
        store,
        render: h => h(Content)
      })
    )

    // We call Vue.mixin() here to inject functionality into all components.
    // Vue.mixin({
      // Anything added to a mixin will be injected into all components.
      // In this case, the mounted() method runs when the component is added to the DOM.
    //   mounted () {
    //     console.log('VueAdminLite is Mounted!')
    //   }
    // })
  }
}
*/

// Automatic installation if Vue has been added to the global scope.
// if (typeof window !== 'undefined' && window.Vue) {
//   window.Vue.use(VueAdminLite, {debug: true})
// }

export default VueAdminLite
