<template>
  <div id="app">
    <h3>Rosco</h3>
    <snk-extension-tab-whymt/>
  </div>
</template>

<script>
  // import SnkExtensionTabWdydt from './whymt/root.vue'

  export default {
    name: 'snk-extension-tab',
    // compoments: {
    //  SnkExtensionTabWdydt
    // },
    data: () => ({
    }),
    computed: { },
    created () {
      console.log('tab created !!!')
    },
    mounted () { },
    methods: {
      tab () {
        chrome.tabs.create({ url: 'pages/app.html' })
      }
    }
  }
</script>

<style lang="scss">
  div {
    color: blue
  }
</style>
