<template>
  <div id="top-site-gallery">
    <ul>
      <li v-for="topSite in $store.state.topSites">
        <TopSiteEntry :topSite="topSite"/>
      </li>
    </ul>
  </div>
</template>

<script>
  // import { mapActions } from 'vuex'
  import store from '../../../../store/store'
  import TopSiteEntry from './entry.vue'

  export default {
    name: 'TopSiteGallery',
    data: function () {
      return {
        topSites: []
      }
    },
    store: store,
    components: {
      'TopSiteEntry': TopSiteEntry
    }
  }
</script>

<style>
  ul {
    list-style: none;
    padding: 0px;
    margin-bottom: 0px;
    margin-top: -15px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 15px;
    grid-auto-rows: minmax(100px, auto);
  }

  #top-site-gallery {
    width: 400px;
    margin-left: 60px;
  }
</style>
