<template lang="pug">
    div {{ devtools }}
</template>

<script>
  // const __ = chrome.i18n.getMessage

  export default {
    data: () => ({
    }),
    computed: { },
    created () {
      console.log('devtools')
      // console.log(__('devtools'))
    },
    mounted () { },
    methods: { }
  }
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>
