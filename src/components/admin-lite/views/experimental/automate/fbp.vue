<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  // name: 'AutomateFbpIndex',
  data () {
    return {
      context: {}
    }
  },
  mounted () {
    console.log('automate-fbp mounted')
  },
  created () {
    console.log('automate-fbp created')
  }
}
</script>

<style>
</style>
