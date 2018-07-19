<template>
  <div class="SearchInput">
    <div class="SearchInput-inputCont">

      <!--
      <v-autocomplete :items="items" v-model="item" :get-label="getLabel" :component-item='template' @update-items="updateItems">
      </v-autocomplete>
      -->

      <!--
      <vue-autosuggest
          :suggestions="[{data:['Frodo', 'Samwise', 'Gandalf', 'Galadriel', 'Faramir', 'Éowyn']}]"
          @click="clickHandler"
          :on-selected="selectHandler"
          :input-props="{id:'autosuggest__input', onInputChange: this.onInputChange, placeholder:'Do you feel lucky, punk?'}"/>
      -->

      <!--
      <v-suggest :data="example" show-field="name" v-model="myValue"></v-suggest>
      -->

      <!--
      <vue-infinite-autocomplete
        :options=currentOptions
        :value=currentValue
        v-on:select="handleOnSelect"
        v-on:loading-state="handleLoadingStateChange"
        v-on:error="handleError">
      </vue-infinite-autocomplete>
      -->

      <!--
      <vue-autosuggest
        :suggestions="suggestions"
        :inputProps="inputProps"
        :sectionConfigs="sectionConfigs"
        :renderSuggestion="renderSuggestion"
        :getSuggestionValue="getSuggestionValue"/>
      -->

      <input
        type="text" class="SearchInput-input form-control" id="auto1" placeholder=""
        v-on:keyup.esc.stop.prevent="unfocus" v-on:focus="onFocus" v-model="keyword"
      />

    </div>
    <button type="button" class="btn btn-primary SearchInput-button" @click.prevent="submit(keyword, $event)">
      <i class="fa fa-search" />
    </button>
  </div>
</template>

<script>
import $ from 'jquery'
import _ from 'lodash'
import { mapState } from 'vuex'
import Mousetrap from 'mousetrap'

import 'jquery-autocomplete/jquery.autocomplete.js'
import 'jquery-autocomplete/jquery.autocomplete.css'

// v-autosuggest (ref.https://github.com/soraino/v-autosuggest)
import axios from 'axios'
import VAutosuggest from 'v-autosuggest'

// vue-autosuggest (ref.https://github.com/Educents/vue-autosuggest)
/*
  Demos
  - https://codesandbox.io/s/627qlx66oz (Deeply nested data objects as suggestions)
  - https://codesandbox.io/s/mjqrk7v2rx (Api Fetching suggestions with Multiple sections)
  - https://educents.github.io/vue-autosuggest/storybook/?selectedKind=Vue-Autosuggest&selectedStory=simplest&full=0&down=1&left=1&panelRight=0&downPanel=storybook%2Factions%2Factions-panel
  - https://jsfiddle.net/darrenjennings/dugbvezs/
*/
import { VueAutosuggest } from 'vue-autosuggest'

// v-autocomplete (ref.https://github.com/paliari/v-autocomplete)
import Autocomplete from 'v-autocomplete'
import 'v-autocomplete/dist/v-autocomplete.css'
import SuggestionTemplate from './SuggestionTemplate.vue'

// v-suggest (ref.https://github.com/TerryZ/v-suggest)
import vSuggest from 'v-suggest'

// vue-infinite-autocomplete (ref. https://github.com/Attrash-Islam/vue-infinite-autocomplete)
import VueInfiniteAutocomplete from 'vue-infinite-autocomplete'

export default {
  components: {
    Autocomplete,
    VueAutosuggest,
    vSuggest,
    'vue-infinite-autocomplete': VueInfiniteAutocomplete,
    VAutosuggest
  },
  data () {
    return {
      // v-autocomplete
      item: {
        id: 9,
        name: 'Lion',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
      },
      items: [],
      template: SuggestionTemplate,

      // v-autosuggest
      searchData: '',
      arrayData: [
        {name: 'Ben', description: '180cm'},
        {name: 'Jon', description: '179cm'},
        {name: 'Smith', description: '190cm'}
      ],

      // vue-infinite-autocomplete
      currentValue: '',
      currentOptions: [],

      // v-autosuggest
      suggestionStatus: {
        nuetralStatus: 0,
        noDataFound: 1,
        loading: 2,
        closeStatus: 3
      },

      // vue-autosuggest
      results: [],
      timeout: null,
      selected: null,
      debounceMilliseconds: 50,
      usersUrl: 'https://jsonplaceholder.typicode.com/users',
      photosUrl: 'https://jsonplaceholder.typicode.com/photos',
      inputProps: {
        id: 'autosuggest__input',
        onInputChange: this.fetchResults,
        placeholder: 'Do you feel lucky, punk?',
        class: 'form-control',
        name: 'hello'
      },
      suggestions: [],
      sectionConfigs: {
        destinations: {
          limit: 6,
          label: 'Destination',
          onSelected: selected => {
            this.selected = selected.item
          }
        },
        hotels: {
          limit: 6,
          label: 'Hotels',
          onSelected: selected => {
            this.selected = selected.item
          }
        }
      },

      // v-suggest
      myValue: '',
      example: [],

      // original
      $elem: undefined,
      $elemInput: undefined,
      keyword: '',
      HI: undefined,
      lastSubmittedKeyword: undefined
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
      clearInputKey: state => state.settings.settings.clearInputKey
    })
  },
  methods: {
    /*
    // vue-autosuggest
    fetchResults (val) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        const photosPromise = axios.get(this.photosUrl)
        const usersPromise = axios.get(this.usersUrl)
        Promise.all([photosPromise, usersPromise]).then(values => {
          this.suggestions = []
          this.selected = null

          const photos = this.filterResults(values[0].data, val, 'title')
          const users = this.filterResults(values[1].data, val, 'name')

          users.length &&
            this.suggestions.push({ name: 'destinations', data: users })
          photos.length &&
            this.suggestions.push({ name: 'hotels', data: photos })
        })
      }, this.debounceMilliseconds)
    },
    filterResults (data, text, field) {
      return data
        .filter(item => {
          if (item[field].toLowerCase().indexOf(text.toLowerCase()) > -1) {
            return item[field];
          }
        }).sort()
    },
    renderSuggestion (suggestion) {
      if (suggestion.name == 'hotels') {
        const image = suggestion.item
        console.log(image)
        return (
          <div>
            <img class={{ avatar: true }} src={image.thumbnailUrl} />
            {image.title}
          </div>
        )
      } else {
        console.log(suggestion)
        return suggestion.item.name
      }
    },
    getSuggestionValue (suggestion) {
      let { name, item } = suggestion
      return name == 'hotels' ? item.title : item.name
    },
    */

    /*
    // v-autocomplete
    getLabel (item) {
      return item.name
    },
    updateItems (text) {
      yourGetItemsMethod(text).then( (response) => {
        this.items = response
      })
    },
    */

    /*
    // vue-infinite-autocomplete
    */

    /*
    // vue-infinite-autocomplete
    changeOptions () {
      this.currentOptions = [
        {text: 'Islam AttrashX', value: 1},
        {text: 'Shai ReznikY', value: 2},
        {text: 'Uri ShakedZ', value: 3},
        {text: 'Salsabel EawissatE', value: 4}
      ]
    },
    handleOnSelect (target, selectedValue) {
      console.log("selected: ", selectedValue)
    },
    handleLoadingStateChange (loadingState) {
      console.log("loading state: ", loadingState)
    },
    handleError (error) {
      console.log("error: ", error)
    },
    */

    unfocus () {
      this.$elem.blur()
    },
    onFocus () {
      if (this.$elem) {
        this.$elem.select()
      }
      this.$store.commit('ui/setFocusedElement', 'searchinput')
    },
    submit (keyword, event) {
      if (keyword === this.lastSubmittedKeyword) {
        return
      }
      this.lastSubmittedKeyword = keyword
      let keyModifier = ''
      if (event.altKey) {
        keyModifier = 'Alt'
      } else if (event.shiftKey) {
        keyModifier = 'Shift'
      } else if (event.ctrlKey) {
        keyModifier = 'Ctrl'
      }
      this.$store.dispatch('searchresults/search', {
        keyword,
        keyModifier
      })
      this.$store.commit('ui/setFocusedElement', 'searchresults')
    }
  },
  watch: {
    focusedElement: function (val, oldVal) {
      if (val === 'searchinput') {
        this.$elem.focus()
      }
    }
  },
  created () {
    console.log('popupsearch - search input - created')
  },
  mounted () {
    console.log('popupsearch - search input - mounted')
    this.keyword = this.$store.state.keywords.currentKeyword

    this.$elem = $('.SearchInput-input')
    this.$elem.autocomplete({
      appendMethod: 'replace',
      showHint: false,
      source: [
        (query, add) => {
          this.$store.dispatch('keywords/loadRemoteKeys', query).then(() => {
            if (this.focusedElement === 'searchinput') {
              add(this.$store.state.keywords.remoteKeywords)
            } else {
              add([])
            }
          })
        }
      ],
      valid: function (value, query) {
        return true
      }
    })
    if (this.focusedElement === 'searchinput') {
      this.$elem.focus()
    }
    this.$elem.on('selected.xdsoft', (event, keyword) => {
      setTimeout(() => {
        this.submit(keyword, event)
      }, 50)
    })
    this.$elemInput = $('.xdsoft_input')
    this.$elem.on('keydown.xdsoft input.xdsoft cut.xdsoft paste.xdsoft', (e, keyword) => {
      this.keyword = this.$elemInput.val()
    })
    this.HI = new Mousetrap(this.$elem[0])
    this.HI.stopCallback = (e) => {
      return false
    }
    if (this.clearInputKey) {
      this.HI.bind(this.clearInputKey.toLowerCase(), (event) => {
        this.$elem.val('')
        this.keyword = ''
      })
    }
    this.HI.bind('esc', (event) => {
      this.$store.commit('ui/setFocusedElement', 'searchresults')
      return false
    })
    this.HI.bind('enter', (event) => {
      this.submit(this.$elemInput.val(), event)
      return false
    })
    this.HI.bind('shift+enter', (event) => {
      this.submit(this.$elemInput.val(), event)
      return false
    })
    this.HI.bind('ctrl+enter', (event) => {
      this.submit(this.$elemInput.val(), event)
      return false
    })
    this.HI.bind('alt+enter', (event) => {
      this.submit(this.$elemInput.val(), event)
      return false
    })
  },
  beforeDestroy () {
    this.HI.reset()
  }
}
</script>

<style lang="sass">
.SearchInput
  width: 100%
  &-inputCont
    width: calc(100% - 50px)
    display: inline-block
  &-button
    display: inline-block
    width: 45px
    height: 38px
    position: relative
    top: -1px
</style>

