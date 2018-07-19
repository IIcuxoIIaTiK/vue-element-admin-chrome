<template>
  <div id="app">
    <router-view v-if="loaded"></router-view>
  </div>
</template>

<script>
import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import 'element-ui/lib/theme-chalk/index.css'
import '@/extension/popup/styles/index.scss' // local css
import '@/extension/popup/icons' // icon

// import PopupSearch from '@/extension/popup/widgets/popupsearch/index.js' // popupsearch widget
// import '@/extension/popup/widgets/viblo/index.js' // viblo widget
// import '@/extension/popup/widgets/onetab/index.js' // onetab widget

export default {
  // name: 'SnkPopup',
  components: {
    // 'snk-popup-search': PopupSearch
  },
  data () {
    return {
      loaded: false
    }
  }
  ,
  async created () {
    await this.$store.dispatch('settings/load')
    await this.$store.dispatch('keywords/load')
    if (!_.isEmpty(this.$store.state.keywords.currentKeyword)) {
      try {
        await this.$store.dispatch('searchresults/search', {
          keyword: this.$store.state.keywords.currentKeyword
        })
      } catch (e) {
      }
    }
    this.loaded = true
  }
}
</script>

<style lang="sass">
body, .app
  margin: auto
  width: 800px
  height: 600px
  overflow-x: hidden
  overflow-y: auto
.app
  padding: 4px 0
</style>
