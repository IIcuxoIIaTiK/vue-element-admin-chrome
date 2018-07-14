<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AdminIndex',
  mounted () {
    console.log('admin-index mounted')
  },
  created () {
    console.log('admin-index created')
  }
}
</script>

<style>
</style>
