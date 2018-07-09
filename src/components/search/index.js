// store/index.js

import Vue from 'vue'
import Vuex from 'vuex'
import searchPlugin from 'vuex-search'
import state from './state'

Vue.use(Vuex)

const store = new Vuex.Store({
  state,
  plugins: [
    searchPlugin({
      resources: {
        contacts: {
          // what fields to index
          index: ['address', 'name'],
          // access the state to be watched by Vuex Search
          getter: state => state.myResources.contacts,
          // how resource should be watched
          watch: { delay: 500 },
        },
        // otherResource: { index, getter, watch, searchApi },
      },
    }),
  ],
})
