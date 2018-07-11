import searchPlugin, { SearchApi } from 'vuex-search'

const store = new Vuex.Store({
  state,
  plugins: [
    searchPlugin({
      resources: {
        contacts: {
          index: ['address', 'name'],
          getter: state => state.myResources.contacts,
        },
      },
      searchApi: new SearchApi({
        // split on all non-alphanumeric characters,
        // so this/that gets split to ['this','that'], for example
        tokenizePattern: /[^a-z0-9]+/,
        // make the search case-sensitive
        caseSensitive: true,
      }),
    }),
  ],
})
