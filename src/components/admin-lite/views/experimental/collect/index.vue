<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'CollectIndex',
  mounted () {
    console.log('collect-index mounted')
  },
  created () {
    console.log('collect-index created')
  }
}
</script>

<style>
</style>
