<template>
  <div id="app">
    <what-did-you-do></what-did-you-do>
  </div>
</template>

<script>
  export default {
    name: 'snk-extension-tab',
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