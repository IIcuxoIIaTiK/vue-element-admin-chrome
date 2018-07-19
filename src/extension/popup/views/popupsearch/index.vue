<template>
  <div class="popupsearch-container">
    <h3>Popup Search</h3>
    <router-view v-if="loaded"></router-view>
  </div>
</template>

<script>
import _ from 'lodash'
import store from '@/extension/popup/widgets/popupsearch/store'
import router from '@/extension/popup/widgets/popupsearch/router'

// import { mapGetters } from 'vuex'

export default {
  name: 'popupsearch',
  /*
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  }, */
  components: {
    store,
    router
  },
  data () {
    return {
      loaded: false
    }
  },
  async created () {
    await this.$store.dispatch('settings/load')
    await this.$store.dispatch('keywords/load')
    if (!_.isEmpty(this.$store.state.keywords.currentKeyword)) {
      try {
        await this.$store.dispatch('searchresults/search', {
          keyword: this.$store.state.keywords.currentKeyword
        })
      } catch (e) {
      }
    }
    this.loaded = true
  }
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
