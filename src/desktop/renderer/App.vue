<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import 'element-ui/lib/theme-chalk/index.css'

import '@/components/admin-lite/styles/index.scss' // local css
import '@/components/admin-lite/icons' // icon

export default {
  name: 'SnkDesktopApp'
}
</script>
