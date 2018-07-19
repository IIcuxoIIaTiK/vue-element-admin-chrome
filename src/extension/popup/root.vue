<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import 'element-ui/lib/theme-chalk/index.css'
import '@/extension/popup/styles/index.scss' // local css
import '@/extension/popup/icons' // icon

export default {
  name: 'SnkPopup'
}
</script>

<style lang="sass">
body, .app
  width: 1000px
  height: 600px
  overflow: hidden
.app
  padding: 4px 0
</style>
