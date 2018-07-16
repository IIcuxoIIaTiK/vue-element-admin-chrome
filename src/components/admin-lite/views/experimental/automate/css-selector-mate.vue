<template>
  <div class="app-container">
    <h3>css-selector-mate as component</h3>
    <css-selector-mate/>
  </div>
</template>

<script>
import cssSelectorMate from '@/components/Custom/Automate/scrape/css-selector/component.vue'

export default {
  // name: 'CssSelectorMate',
  components: {
    cssSelectorMate
  },
  data () {
    return {
      context: {}
    }
  },
  mounted () {
    console.log('css-selector-mate mounted')
  },
  created () {
    console.log('css-selector-mate created')
  }
}
</script>

<style>
</style>
