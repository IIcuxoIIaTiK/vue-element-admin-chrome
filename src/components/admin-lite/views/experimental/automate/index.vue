<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AutomateIndex',
  mounted () {
    console.log('automate-index mounted')
  },
  created () {
    console.log('automate-index created')
  }
}
</script>

<style>
</style>
