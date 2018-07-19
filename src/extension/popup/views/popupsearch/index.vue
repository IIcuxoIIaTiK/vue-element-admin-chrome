<template>
  <div class="popupsearch-container">
    <h3>PopupSearch</h3>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'popupsearch'/*,
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  }*/
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.popupsearch {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
