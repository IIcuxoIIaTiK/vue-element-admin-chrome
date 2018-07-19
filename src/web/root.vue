<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
// import Vue from 'vue'
// import 'normalize.css/normalize.css'// A modern alternative to CSS resets
// import 'element-ui/lib/theme-chalk/index.css'
// import '@/components/admin-lite/styles/index.scss' // local css
// import '@/components/admin-lite/icons' // icon

export default {
  name: 'SnkWebApp',
  data () {
    return {
      count: 0,
      hint: ''
    }
  },
  storage: {
    keys: ['count'],
    //keep data.count in localStorage
    namespace: 'snk-namespace'
  },
  //Listen for path changes in the component and get a list of paths
  watch: {
    '$history.routes' (val) {
      console.log('$history.routes, new: ', val)
      // this.path = val;
    }
  },
  directives: { },
  computed: { },
  services: ['$http', '$tablePaginate', '$outsideEvents'],
  mounted () {
    console.log('[chrome-web] - content mounted !!!')

    console.log('this.$uuidKey: ', this.$uuidKey)

    let callback = (val, oldVal, uri) => {
      console.log('localStorage change', val)
    }

    /*
    Vue.ls.set('foo', 'boo')
    //Set expire for item
    Vue.ls.set('foo', 'boo', 60 * 60 * 1000) //expiry 1 hour
    Vue.ls.get('foo')
    Vue.ls.get('boo', 10) //if not set boo returned default 10

    Vue.ls.on('foo', callback) //watch change foo key and triggered callback
    Vue.ls.off('foo', callback) //unwatch
    Vue.ls.remove('foo')
    */

    /*
    this.$ls.set('foo', 'boo')
    //Set expire for item
    this.$ls.set('foo', 'boo', 60 * 60 * 1000) //expiry 1 hour
    this.$ls.get('foo')
    this.$ls.get('boo', 10) //if not set boo returned default 10

    this.$ls.on('foo', callback) //watch change foo key and triggered callback
    this.$ls.off('foo', callback) //unwatch
    this.$ls.remove('foo')
    */
  },
  created () {
    // console.clear()
    // console.log('[chrome-web] - console.clear() from root.vue')
    console.log('[chrome-web] - content created !!!')
    console.log('[chrome-web] - config.all: ', this.$config.all())
    console.log('[chrome-web] - config.created.identifier: ', this.$config.get('identifier', 'DEFAULT_IDENTIFIER'))
    console.log('[chrome-web] - config.created.facebook: ', this.$config.get('facebook', {}))
    console.log('[chrome-web] - config.created.allowLogin: ', this.$config.get('allowLogin', false))
  },
  methods: {
    handleResize (e, el) {
      console.log('handleResize')
    },
    changeSize (w) {
      document.getElementById('st-menu').width = w
    }
  }
}
</script>
