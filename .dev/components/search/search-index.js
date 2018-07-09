import searchPlugin, { SearchApi, INDEX_MODES } from 'vuex-search'

// all-substrings match by default; same as current
// eg 'c', 'ca', 'a', 'at', 'cat' match 'cat'
const allSubstringsSearchApi = new SearchApi()

// prefix matching (eg 'c', 'ca', 'cat' match 'cat')
const prefixSearchApi = new SearchApi({
  indexMode: INDEX_MODES.PREFIXES,
});

// exact words matching (eg only 'cat' matches 'cat')
const exactWordsSearchApi = new SearchApi({
  indexMode: INDEX_MODES.EXACT_WORDS,
});

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
      searchApi: exactWordsSearchApi, // or allSubstringSearchApi; or prefixSearchApi
    }),
  ],
})
