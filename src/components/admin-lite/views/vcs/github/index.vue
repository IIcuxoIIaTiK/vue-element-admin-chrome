<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'GithubSearch',
  mounted () {
    console.log('github-index mounted, url=', this.url)
  },
  created () {
    console.log('github-index created, url=', this.url)
  }
}
</script>

<style>
</style>