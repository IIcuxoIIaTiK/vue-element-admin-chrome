import Vue from 'vue'

Vue.config.productionTip = false

// This is your plugin object. It can be exported to be used anywhere.
const VueAdminLite = {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install (Vue, options) {
    Vue.component('VueAdminLite', Content)
    // We call Vue.mixin() here to inject functionality into all components.
    Vue.mixin({
      // Anything added to a mixin will be injected into all components.
      // In this case, the mounted() method runs when the component is added to the DOM.
      mounted () {
        console.log('VueAdminLite is Mounted!')
      }
    })
  }
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(VueAdminLite, {debug: true})
}

export default VueAdminLite
