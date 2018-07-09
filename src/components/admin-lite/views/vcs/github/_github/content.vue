<template>
  <div id="gh-search-results">
    <ListItem></ListItem>        
  </div>
</template>

<script>
import ListItem from '@/components/admin-lite/components/Search/Github/ListItem.vue'
import _ from 'lodash'
import {mapGetters} from 'vuex'

export default {
  name: 'gh-search-results',
  data () {
    return {
      a: ''
    }
  },
  components:{
    ListItem: ListItem
  },
  computed: {
   
  },
  methods: {
   
  }
}
</script>

<style>
#search-results {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#search-results > h1, h2 {
  font-weight: normal;
}

#search-results > ul {
  list-style-type: none;
  padding: 0;
}

#search-results > li {
  display: inline-block;
  margin: 0 10px;
}

#search-results > a {
  color: #42b983;
}
</style>
