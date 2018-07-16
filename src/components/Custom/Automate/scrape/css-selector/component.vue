<template>
  <div id="sidebar">
    <!-- Head Controls -->
    <div id="head-controls">
      <div class="buttons">
        <div>
          <button class="blue plain-button fas fa-plus" @click="newTemplate" title="Create new template"></button>
          <button class="plain-button fas fa-arrows-alt-h" @click="sendMessage('togglePosition')"
            title="Toggle sidebar position"></button>
          <button :disabled="jsDisabled === null"
            :class="[jsDisabled === null ? 'unknown' : (jsDisabled ? 'disabled' : 'enabled')]"
            @click="sendMessage('toggleJs')"
            class="plain-button fas fa-code js"
            title="Toggle JavaScript"></button>
          <button class="plain-button fas fa-list" @click="openTemplatesView" title="Show all archived templates"></button>
          <button class="plain-button fas fa-pencil-alt" @click="openJsonEditor" title="Edit template as JSON"></button>
          <button class="plain-button far fa-clone" :disabled="!this.templates[this.template.id]" @click="cloneCurrentTemplate"
            title="Clone current template"></button>
          <button class="plain-button fas fa-fast-backward" @click="revertTemplate" title="Undo all modifications" :disabled="!stashedTemplate || !templateEdited"></button>
        </div>
        <button class="conf plain-button fas fa-cog" title="Options/Info" @click="confView = true"></button>
        <button class="red plain-button fas fa-times" @click="sendMessage('close')"></button>
      </div>
      <div class="title">
        <label for="template-title" class="left">Template: </label>
        <input class="template-title" id="template-title" @input="onTemplateTitleInput" v-model="template.title"/>
      </div>
    </div>
    <!-- Fields List -->
    <div id="field-list">
      <div :key="i"
          class="field"
          ref="field"
          :class="{picking:field===pickingField}"
          v-for="(field, i) in template.fields"
          @mouseenter="sendMessage('highlight', field.selector)"
          @mouseleave="sendMessage('unhighlight')">
          <div class="inner">
            <div class="top">
              <input v-model.trim="field.name" @input="onFieldNameInput(field)" placeholder="field name">
              <button @click="onPickerClick(field, $event)"
                      class="orange plain-button fas fa-magic"
                      title="Start picker"
                      @keypress.prevent>
                      </button>
              <button class="plain-button far fa-clone"
                      title="Clone field"
                      @click="cloneField(i)">
                      </button>
              <button :disabled="i === fields.length-1"
                      class="plain-button far fa-circle"
                      title="Reset selector"
                      @click="resetSelector(field)">
                      </button>
              <button class="plain-button fas fa-minus"
                      :disabled="i === fields.length-1"
                      @click="removeField(i)">
                      </button>
          </div>
          <div class="bottom">
            <input v-model.trim="field.selector"
                    class="selector"
                    placeholder="css or xpath"
                    :class="{error:fieldCovers[i] === -1}"
                    @input="onSelectorInput(field)"
                    @keyup.enter="onSelectorEnter(field)">
            <span :disabled="i === fields.length-1" class="amount">{{ fieldCovers[i] === -1 ? 0 : fieldCovers[i] }}</span>
          </div>
          <div v-if="i !== fields.length-1" class="indicator" :class="[fieldCovers[i] === undefined ? 'unknown' : (fieldCovers[i] > 0 ? 'good' : 'bad')]"></div>
          <div v-else class="indicator"></div>
        </div>
      </div>
    </div>

    <!-- Configuration View -->
    <div class="modal-overlay" @click.self="resetView();onOptionsEdited()" v-if="confView">
      <div id="conf">
        <div class="settings">
          <label><input v-model="options.autonojs" type="checkbox">Automatically disable JavaScript.</label>
        </div>
        <b>Data Tab:</b><br>
        In picking mode data previews show a few special properties alongside element real attributes.<br>
        Those are:<br>
        _html - element inner html.<br>
        _tag - element tag name (e.g. "a", "div", "span").<br>
        _text - list of element direct texts (e.g. <span style="color: #af4356">&lt;span&gt;hello &lt;b&gt;to&lt;/b&gt; you&lt;/span&gt;</span> will be ["hello ", " you"]).<br>
        _val - value under special nonstandard css pseudo elements if used (e.g. "div a::attr(href)"), these are supported by scrapy for example.<br><br>
        <b>Hotkeys:</b><br>
        Left/Right Arrow Keys - toggle sidebar position.<br>
        Backspace, Delete - (in picking mode) reset current selector.<br>
        Esc - dismiss current popup or turn off picking mode.<br>
      </div>
    </div>

    <!-- Templates List -->
    <div class="modal-overlay" @click.self="resetView" v-if="templatesView">
      <div id="templates-list">
        <div class="buttons">
          <label class="custom-file-picker plain-button" title="Import new templates from file">
            <input type="file" @change="importTemplates($event)"/>import
          </label>
          <div class="sep"></div>
          <button class="plain-button" @click="exportTemplates" :disabled="!selectedTemplates.length" title="Save templates to file">export</button>
          <button class="plain-button" @click="removeSelectedTemplates" :disabled="!selectedTemplates.length">delete</button>
          <button class="plain-button" @click="selectAllTemplates" >{{selectedTemplates.length ? 'none' : 'all'}}</button>
        </div>
        <div class="list">
          <div v-for="(t, i) in sortedTemplates"
              :title="t.title" :key="t.id"
              @click="selectTemplate(t)"
              @dblclick="pickTemplate(t)"
              :class="{selected:selectedTemplates.includes(t.id)}" class="template">
              <div class="title">{{ t.title }}</div>
              <div class="stat" :class="[templateStat[i].matchPower]">{{ templateStat[i].selCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Json Editor -->
    <div class="modal-overlay" @click.self="resetView" v-if="jsonEditorView">
      <div id="json-editor">
        <div class="buttons">
          <button class="plain-button" @click="copyJsonEditor">copy</button>
          <button class="plain-button" @click="resetJsonEditor" :disabled="jsonEditorIsReset">reset</button>
          <button class="plain-button" @click="applyJsonEditor" :disabled="jsonEditorIsReset">apply</button>
        </div>
        <textarea ref="jsonEditor" v-model="jsonEditorText" @input="jsonEditorIsReset = false"></textarea>
      </div>
    </div>

    <!-- Control Tabs -->
    <div id="control-tabs" ref="controlTabs" v-show='controlTabsView'>
      <div class="inner">
        <div class="buttons">
          <button class="data"
                  @click="controlTab = 'data'"
                  :disabled="controlTab === 'data'">Data</button>
          <button class="soon"
                  @click="controlTab = 'soon'"
                  :disabled="controlTab === 'soon'">Soon™</button>
        </div>
        <div class="window">
          <!-- Data Single Element -->
          <div v-if="controlTab === 'data' && selElemAttrs.length == 1" class="data single">
            <div v-for="([attr, value]) in sortedSelElemAttrs[0]" :key="attr">
              <span class="attr">{{ attr }}</span><span class="value">{{ value }}</span>
            </div>
          </div>
          <!-- Data Many Elements -->
          <div v-else-if="controlTab === 'data' && selElemAttrs.length > 1" class="data many">
            <div class="buttons">
              <button v-for="attr in selElemUniqAttrs" :disabled="attrToShow == attr" :key="attr" @click="attrToShow = attr">
                {{attr}}
              </button>
            </div>
            <div class="value" :key="i" v-for="(attrs, i) in selElemAttrs">{{ attrs[attrToShow] }}</div>
          </div>
          <!-- Reserved -->
          <div v-else-if="controlTab === 'soon'" class="soon">Nothing here yet.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import browser from 'webextension-polyfill'
import _ from 'lodash'

import WindowBus from './scripts/bus.js'
import Selector from './scripts/selector.js'
import { insertElem } from './scripts/util.js'
// import './extension/content'.()

import '@/assets/3rdparty/selector-gadget/selectorgadget_combined.css'

// Template - main data model for this application:
// {
//     id: {
//         fields: [
//             {name: '', selector: ''},
//             ...
//         ],
//         title: '',
//         urls: ['', ...] // pages template was ever edited on
//     },
//     ...
// }

const htmlAttrImportance = [
  '_val', 'value', 'href', 'src', 'title', 'alt', 'name', 'html', '_text',
  attr => attr.startsWith('data-'),
  attr => !attr.startsWith('on')
]

const parentBus = new WindowBus()

// Utils
////////////////////////////////////////////////////////////////////////////////

function toBooleanSorters (sorters) {
  return sorters.map(sorter => _.isFunction(sorter) ? _.negate(sorter) : v => v !== sorter)
}

function no3w (string) {
  return string.replace(/^www\./, '')
}

// Main
////////////////////////////////////////////////////////////////////////////////
export default {
  data () {
    return {
      template: {}, // current template
      templates: [], // all templates
      loc: null, // page location
      selCovers: {}, // number of element each selector covers
      pickingField: null, // field that selector picker is active on

      stashedTemplate: null, // stashed copy of current template (for revert)
      templateEdited: false,
      selectedTemplates: [],

      jsDisabled: null,
      options: {
        autonojs: false
      },

      // TODO:low just one var - currentView
      jsonEditorView: false,
      controlTabsView: false,
      templatesView: false,
      confView: false,

      jsonEditorText: '',
      jsonEditorIsReset: true,

      controlTab: 'data',

      selElemAttrs: [], // [[[attrName, attrVale]...], ...]
      selElemUniqAttrs: [], // [attrName, ...]
      attrToShow: null
    }
  },
  created: async function () {
    // setup communication with the page
    parentBus.setReceiver(window.parent)
    Object.keys(this).filter(k => k.startsWith('remote_')).forEach(k => {
      // TODO:low remote_ to exposed_ or something to match the parent
      let kk = k.slice('remote_'.length)
      parentBus.handlers[kk] = this[k].bind(this)
    })
    parentBus.listen()

    this.sendMessage('isJsDisabled').then(v => this.jsDisabled = v)

    // retrieve config and templates
    let storage = await this.sendMessage('loadStorage')
    this.options = Object.assign({}, this.options, storage['options'] || {})
    Object.entries(storage).forEach(([k, v]) => {
      if (!k.startsWith('_')) {
        return
      }
      let [id, t] = [k, v]
      this.augmentTemplate(t, id)
      Vue.set(this.templates, id, t)
    })

    // test all available template selectors on current page
    this.checkAndUpdateSelectors(this.getAllSelectors(this.templates))

    // get page url
    this.loc = new URL(await this.sendMessage('getLocation'))

    // get best matching template
    let id = await this.findTemplate()
    if (!id) {
      this.newTemplate()
    } else {
      this.template = this.templates[id]
      this.stashedTemplate = _.cloneDeep(this.template)
    }
  },
  mounted: function () {
    window.addEventListener('keyup', e => this.onKeyUp(e))
    this.$el.style = '' // show everything
  },
  computed: {
    fields () {
      return this.template.fields || []
    },
    fieldCovers () {
      // selCovers but accessing from fields
      return this.fields.map(f => this.selCovers[f.selector])
    },
    sortedTemplates () {
      if (!this.loc) {
        return []
      }
      return _.sortBy(_.values(this.templates), [
        t => t !== this.template, // current template
        t => no3w(t.lastLoc.hostname) !== no3w(this.loc.hostname), // same host
        t => no3w(t.lastLoc.host) // hostname alphabetic
      ])
    },
    sortedSelElemAttrs () {
      if (!this.selElemAttrs.length) {
        return []
      }
      let sorters = _.concat(toBooleanSorters(htmlAttrImportance), _.identity)
      let pairsSorters = sorters.map(s => v => s(v[0]))
      return this.selElemAttrs.map(attrs => {
        return _.sortBy(_.toPairs(attrs), pairsSorters)
      })
    },
    templateStat () {
      return _.values(this.sortedTemplates).map(t => {
        let liveSels = '?'
        let matchPower = 'low'
        let fields = t.fields.slice(0, -1)
        let hasUndefined = _.find(fields, f => this.selCovers[f.selector] === undefined)
        if (!hasUndefined) {
          liveSels = _.filter(fields, f => this.selCovers[f.selector] > 0).length
          if (liveSels > 0) {
            matchPower = 'medium'
          }
          if (liveSels === fields.length) {
            matchPower = 'high'
          }
        } else {
          matchPower = 'unknown'
        }
        return {selCount: liveSels + '/' + (fields.length), matchPower: matchPower}
      })
    }
  },
  methods: {
    onKeyUp (e) {
      // note: on remote call from parent window e.target will not be set
      let isRoot = _.includes([undefined, document.body], e.target)
      if (e.keyCode === 27) {
        // esc
        this.resetView()
      } else if (_.includes([8, 46], e.keyCode) && isRoot && this.pickingField) {
        // backspace
        this.resetSelector(this.pickingField)
      } else if (_.includes([37, 39], e.keyCode) && isRoot) {
        // < and > arrow keys
        this.sendMessage('togglePosition')
      }
    },
    sendMessage (event, data) {
      // cooperate with our content script in the page
      return parentBus.sendMessage(event, data)
    },
    resetView () {
      this.disablePicker()
      this.controlTabsView = false
      this.jsonEditorView = false
      this.templatesView = false
      this.confView = false
    },
    getAllSelectors (templates) {
      return _.chain(templates).values().flatMap(t => t.fields.map(f => f.selector)).uniq().value()
    },
    onOptionsEdited () {
      this.sendMessage('saveStorage', {options: this.options})
    },
    remote_resetView () { this.resetView() },
    remote_keyUp (e) { this.onKeyUp(e) },
    // Template Management
    makeTemplate (augment) {
      return {
        fields: [],
        title: no3w(this.loc.hostname) + this.loc.pathname.replace(/\/$/, ''),
        urls: [this.loc.href]
      }
    },
    augmentTemplate (t, id) {
      t.id = id ? id : '_' + Date.now()
      t.lastLoc = new URL(_.last(t.urls) || this.loc.href)
      t.fields.push(this.makeField())
    },
    cloneCurrentTemplate () {
      let t = _.cloneDeep(this.template)
      t.id = '_' + Date.now()
      t.title += ' New'
      this.template = t
      this.commitTemplate()
      this.templateEdited = false
    },
    revertTemplate () {
      if (!confirm('Undo all edits made to this template?')) {
        return
      }
      this.resetView()
      this.template = this.stashedTemplate
      this.stashedTemplate = _.cloneDeep(this.template)
      Vue.set(this.templates, this.template.id, this.template)
      this.templateEdited = false
    },
    newTemplate () {
      this.resetView()
      this.template = this.makeTemplate()
      this.stashedTemplate = null
      this.augmentTemplate(this.template)
    },
    openTemplatesView () {
      this.resetView()
      this.templatesView = true
    },
    pickTemplate (t) {
      this.template = t
      this.stashedTemplate = _.cloneDeep(this.template)
      this.checkAndUpdateSelectors()
      this.templatesView = false
    },
    removeSelectedTemplates () {
      this.templates = _.omit(this.templates, this.selectedTemplates)
      this.sendMessage('removeStorageKeys', this.selectedTemplates)
      this.selectedTemplates = []
    },
    selectTemplate (t) {
      if (_.includes(this.selectedTemplates, t.id)) {
        this.selectedTemplates = _.without(this.selectedTemplates, t.id)
      } else {
        this.selectedTemplates.push(t.id)
      }
    },
    selectAllTemplates () {
      if (this.selectedTemplates.length) {
        this.selectedTemplates = []
      } else {
        this.selectedTemplates = _.keys(this.templates)
      }
    },
    commitTemplate () {
      this.templateEdited = true
      if (!_.includes(this.template.urls, this.loc.href)) {
        this.template.urls.push(this.loc.href)
      }
      Vue.set(this.templates, this.template.id, this.template)
      let template = _.pick(this.template, ['title', 'fields', 'urls'])
      template.fields = template.fields.slice(0, -1) // remove ghost field
      this.sendMessage('saveStorage', {[this.template.id]: template})
    },
    findTemplate () {
      // looks for template matching this page
      return new Promise(async resolve => {
        // filter out outside domain templates
        let candidates = _.pickBy(this.templates, t => {
          return t.lastLoc.hostname === this.loc.hostname
        })

        let id2sels = _.mapValues(candidates, t => _.map(t.fields, 'selector'))
        let uniqSels = _.chain(id2sels).values().flatMap().uniq().value()
        let data = await this.sendMessage('checkSelectors', uniqSels)

        // count amount of working on this page selectors for each template
        var counted = Object.entries(id2sels).map(([id, sels]) => {
          return [id, sels.filter(s => data[s]).length]
        })
        counted.sort((a, b) => b[1] - a[1])
        let top = counted[0]

        if (top && top[1] > 0) {
          resolve(top[0])
          return
        }

        // if no templates found try to find template
        // with a url (hostname+pathname) match
        let id = _.findKey(candidates, t => {
          return (t.lastLoc.hostname + t.lastLoc.pathname) === (this.loc.hostname + this.loc.pathname)
        })
        resolve(id)
      })
    },
    onTemplateTitleInput: _.debounce(function () { this.commitTemplate() }, 300),

    // Fields/Selectors Management
    makeField () {
      return {name: '', selector: ''}
    },
    addField () {
      this.template.fields.push(this.makeField())
      this.commitTemplate()
    },
    removeField (idx) {
      if (this.fields[idx] === this.pickingField) {
        this.disablePicker()
      }
      this.template.fields.splice(idx, 1)
      this.commitTemplate()
    },
    onPickerClick (f, e) {
      if (f === _.last(this.fields)) {
        this.addField()
      }

      e.target.blur()
      if (!this.pickingField) {
        this.enablePicker(f)
      } else if (this.pickingField === f) {
        this.disablePicker()
      } else {
        this.disablePicker()
        this.enablePicker(f)
      }
    },
    enablePicker (f) {
      this.sendMessage('enablePicker')
      this.pickingField = f
      this.controlTabsView = true
      this.submitSelector(f.selector)
      this.getSelElemAttrs(f.selector)

      let idx = _.findIndex(this.fields, ff => ff === f)
      setTimeout(() => {
        let fbox = this.$refs.field[idx].getBoundingClientRect()
        let cbox = this.$refs.controlTabs.getBoundingClientRect()
        let scrollBy = (fbox.y + fbox.height + fbox.height * 0.85) - cbox.y
        if (scrollBy > 0) {
          this.$el.scrollTop += scrollBy
        }
      }, 100)
    },
    disablePicker () {
      this.sendMessage('disablePicker')
      this.controlTabsView = false
      this.pickingField = null
    },
    submitSelector (sel) {
      this.sendMessage('changeSelectorPicked', sel)
    },
    onSelectorInput (f) {
      if (f === _.last(this.fields)) {
        this.addField()
      }
      this._onSelectorInput(f)
    },
    _onSelectorInput: _.debounce(function (f) {
      let sel = f.selector
      this.checkAndUpdateSelectors([sel])
      this.sendMessage('highlight', sel)
      this.commitTemplate()
      if (this.pickingField) {
        this.getSelElemAttrs(sel)
      }
    }, 300),
    onSelectorEnter (f) {
      if (f === this.pickingField) {
        this.submitSelector(f.selector)
      }
    },
    onFieldNameInput (f) {
      if (f === _.last(this.fields)) {
        this.addField()
      }
      this._onFieldNameInput()
    },
    _onFieldNameInput: _.debounce(function () { this.commitTemplate() }, 300),
    async checkAndUpdateSelectors (sels) {
      if (!sels) {
        sels = this.template.fields.map(f => f.selector)
      }
      let data = await this.sendMessage('checkSelectors', sels)
      this.selCovers = Object.assign({}, this.selCovers, data)
    },
    async getSelElemAttrs (sel) {
      let data = await this.sendMessage('getSelElemAttrs', sel)
      let sorters = _.concat(toBooleanSorters(htmlAttrImportance), _.identity)

      this.selElemAttrs = data
      this.selElemUniqAttrs = _.chain(data).flatMap(_.keys).uniq().sortBy(sorters).value()
      this.attrToShow = this.selElemUniqAttrs[0]
    },
    cloneField (idx) {
      this.template.fields.splice(idx, 0, _.cloneDeep(this.fields[idx]))
      this.commitTemplate()
    },
    resetSelector (f) {
      if (!f) {
        return
      }
      f.selector = ''
      this.onSelectorInput(f)
      if (f === this.pickingField) {
        this.submitSelector(f.selector)
      }
    },
    remote_selectorPicked (sel) {
      if (this.pickingField) {
        this.pickingField.selector = sel
      }
      this.commitTemplate()
      this.getSelElemAttrs(sel)
      // don't mess with this line even if it makes little sense here
      this.checkAndUpdateSelectors([sel])
    },

    // Import/Export
    async exportTemplates () {
      let storage = await this.sendMessage('loadStorage')
      let templates = _.pick(storage, this.selectedTemplates)
      let content = JSON.stringify(templates, null, 2)
      this.sendMessage('saveText', content)
    },
    importTemplates (e) {
      let file = e.target.files[0]
      if (file.type !== 'application/json') {
        alert(`Incorrect file type of "${file.name}": ${file.type}\nExpected: application/json`)
        return
      }
      let reader = new FileReader()
      reader.addEventListener('load', e => {
        try {
          let object = JSON.parse(reader.result)
          this.commitImportedTemplates(object)
        } catch (e) {
          alert(`Import failed: ${e}\nCheck console for details.`)
          throw e
        }
      })
      // TODO:low report problem with loading it or something?
      reader.readAsText(file)
    },
    commitImportedTemplates (object) {
      let templates = Object.entries(object).map(([id, t]) => {
        id = id.toString()
        if (!id.startsWith('_')) id = '_' + id
        let tt = this.makeTemplate()
        tt.urls = t.urls.map(s => s.toString())
        tt.title = t.title.toString()
        tt.fields = t.fields.map(f => {
          let ff = this.makeField()
          ff.name = f.name.toString()
          ff.selector = f.selector.toString()
          return ff
        })
        if (this.templates[id]) {
          console.log(`ScrapeMate will overwrite ${id}:`, tt)
        } else {
          console.log(`ScrapeMate will create ${id}:`, tt)
        }
        return [id, tt]
      })
      this.sendMessage('saveStorage', _.fromPairs(templates))
      templates.forEach(([id, t]) => {
        this.augmentTemplate(t, id)
        Vue.set(this.templates, id, t)
      })
      this.checkAndUpdateSelectors(this.getAllSelectors(_.fromPairs(templates)))
    },
    // Field JSON editor
    openJsonEditor () {
      this.resetView()
      this.resetJsonEditor()
      this.jsonEditorView = true
    },
    applyJsonEditor () {
      try {
        let data = JSON.parse(this.jsonEditorText)
        let fields = []
        Object.entries(data).forEach(([k, v]) => {
          let f = this.makeField()
          f.name = k
          f.selector = v.sel
          fields.push(f)
        })
        this.template.fields = fields
        this.fields.push(this.makeField())
        this.commitTemplate()
        this.checkAndUpdateSelectors()
        this.jsonEditorView = false
        this.resetJsonEditor()
      } catch (e) {
        alert('Failed to apply specified json: ' + e)
        throw e
      }
    },
    resetJsonEditor () {
      this.jsonEditorIsReset = true
      let object = _.fromPairs(this.template.fields.slice(0, -1).map(f => {
        return [f.name, {sel: f.selector, type: Selector.getType(f.selector)}]
      }))
      this.jsonEditorText = JSON.stringify(object, null, 2)
    },
    copyJsonEditor () {
      this.$refs.jsonEditor.select()
      document.execCommand('copy')
    }
  }
}
</script>

<style>
  #sidebar {
    overflow-y: auto;
    overflow-x: hidden;
    font-size: 13px;
    height: 100%;
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  }

  /* generics */
  .plain-button {
    padding: 5px 10px;
    font-size: 13px;
    line-height: 1;
    color: #fff;
    text-shadow: 0 -1px 0 rgba(0,0,0,0.25);
    background-color: #2f2f2f;
    border-width: 0px;
    vertical-align: middle;
    cursor: pointer;
    border-radius: 2px;
  }

  .plain-button.orange {
    background-color: #EE9822;
  }

  .plain-button.red {
    background-color: rgb(189, 54, 47);
  }

  .plain-button.blue {
    background-color: rgb(0, 113, 204);
  }

  .plain-button[disabled] {
    opacity: .6;
    cursor: default;
  }

  .plain-button[disabled]:hover {
    box-shadow: none;
  }

  .plain-button:hover {
    box-shadow: 0 1px 2px grey;
  }

  .plain-button:active {
    transform: translateY(1px);
  }

  .plain-button[disabled]:active {
    transform: none;
  }

  b {
    font-weight: bold;
  }

  #sidebar input:not([type]) {
    background-color: rgba(0, 0, 0, 0.23);
    border-radius: 2px;
    border: 0px;
    /* outline-color: rgb(250, 167, 50); */
    outline-color: transparent;
    color: #ffffff;
    padding: 4px 6px;
  }

  #sidebar input:not([type])::placeholder {
    color: #ffffff73;
  }

  #sidebar input:not([type]):focus {
    box-shadow: 0 1px #f38d00, 0 2px #f38d0063;
  }

  .custom-file-picker > input[type="file"] {
    display: none;
  }

  .fas, .far {
    text-shadow: none;
    color: #ffffffe7;
  }

  .far {
    font-weight: 400;
  }

  /* head-controls */
  #head-controls {
    background: #bbb;
    padding: 5px;
  }

  #head-controls div.buttons {
    display: flex;
    justify-content: space-between;
  }

  #head-controls div.buttons button.conf {
    border: none;
    background-color: transparent;
    font-size: 90%;
    margin-left: auto;
    color: #0000005c;
    outline: none;
  }

  #head-controls div.buttons button.conf:hover {
    box-shadow: none;
    color: #0000008f;
  }

  #head-controls div.buttons button.js {
    position: relative;
    overflow: hidden;
  }

  #head-controls div.buttons button.js::after {
    content: '';
    display: none;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 10px 0 0;
    border-color: #696969 transparent transparent transparent;
    top:0;
    left: 0;
    position: absolute;
  }

  #head-controls div.buttons button.js.enabled::after {
    display: block;
    border-color: #48a70e transparent transparent transparent;
  }

  #head-controls div.buttons button.js.disabled::after {
    display: block;
    border-color: #ff0000 transparent transparent transparent;
  }

  #head-controls div.title {
    padding: 0;
    margin-top: 4px;
    display: flex;
    font-weight: bold;
    color: #272727f5;
    text-shadow: 0 -1px 0 rgba(255, 255, 255, 0.25);
  }

  #head-controls label {
    padding: 3px 4px 0px 0px;
  }

  #head-controls input.template-title {
    width: 100%;
    background-color: transparent;
    font-weight: inherit;
    border: 0px;
    color: inherit;
    text-shadow: inherit;
    box-shadow: none;
    outline-color: transparent;
    padding: 2px 0px;
    text-overflow: ellipsis;
  }

  /* field list */
  #field-list .field {
    border-bottom: 1px dashed #eeeeee70;
    padding: 5px 5px;
  }

  #field-list .field:last-of-type {
    border-bottom: none;
    margin-bottom: 320px;
  }

  #field-list .field.picking {
    /* box-shadow: 0 0 120px black, 0 0 200px black; */
    border: 3px dotted black;
    background-color: #ffffff45;
  }

  #field-list .field:hover {
    background-color: #ffffff45;
  }

  #field-list .field .inner {
    position: relative;
    padding: 6px 0;
  }

  #field-list .field .top {
    margin-bottom: 4px;
    padding-right: 11px;
    display: flex;
    justify-content: space-between;
  }

  #field-list .field .top input {
    width: 100%;
  }

  #field-list .field .bottom {
    display: flex;
    padding-right: 13px;
  }

  #field-list .field input.selector {
    width: 100%;
    margin-right: 5px;
  }

  #field-list .field .bottom span {
    color: #fff;
    font-weight: bold;
    text-shadow: 0 -1px 0 rgba(0,0,0,0.25);
    padding-top: 4px;
  }

  #field-list .field input.selector.error {
    background-color: #984f4fbf;
  }

  #field-list .field button {
    margin-left: 5px;
  }

  #field-list div.indicator {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 4px;
  }

  #field-list div.indicator.unknown {
    background-color: #d6d6d6;
  }

  #field-list div.indicator.good {
    background-color: #37c737c2;
  }

  #field-list div.indicator.bad {
    background-color: #ff5454e6;
  }

  /* json editor */
  #json-editor {
    padding: 8px;
    border-radius: 3px;
    margin-top: 50px;
    background-color: #d8d8d8;
    height: 70%;
    width: 90vw;
    display: flex;
    flex-direction: column;
  }

  #json-editor textarea {
    width: 100%;
    height: 100%;
    border: 0;
    padding: 5px;
    background-color: #ffffff88;
  }

  #json-editor .buttons {
    padding-bottom: 5px;
  }

  /* templates list */
  #templates-list {
    border-radius: 3px;
    margin-top: 50px;
    margin-bottom: 5px;
    background-color: #d8d8d8;
    max-height: 90%;
    width: 93vw;
    display: flex;
    flex-direction: column;
    align-content: flex-start;
  }

  #templates-list .buttons {
    display: flex;
    box-shadow: 0 1px #00000042;
    min-height: 34px;
  }

  #templates-list .buttons button {
    margin: 5px 4px 5px 0;
  }

  #templates-list .buttons button:last-of-type {
    margin-left: auto;
  }

  #templates-list .buttons .sep {
    margin: 9px 3px 8px 0;
    width: 1px;
    border-left: 1px solid #00000042;
  }

  #templates-list .list {
    padding-top: 5px;
    background-color: #ffffff21;
    overflow-y: auto;
    overflow-x: hidden;
  }

  #templates-list .template {
    margin-bottom: 2px;
    box-shadow: 0 1px #ffffff66;
    padding: 2px 8px;
    display: flex;
    justify-content: space-between;
  }

  #templates-list .template:hover {
    cursor: pointer;
    background-color: #88888842;
  }

  #templates-list .template.selected {
    background-color: #e8636375;
  }

  #templates-list .template:first-of-type .title::before {
    /* bullet point */
    content: '\2022  ';
  }

  #templates-list .template > div {
    vertical-align: baseline;
    line-height: 20px
  }

  #templates-list .template .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  #templates-list .template .stat {
    margin-left: 2px;
  }

  #templates-list .template .stat.unknown {
    color: #00000075;
  }

  #templates-list .template .stat.medium {
    color: #6d8000ba;
    font-weight: bold;
  }

  #templates-list .template .stat.high {
    color: #029402;
    font-weight: bold;
  }

  #templates-list .custom-file-picker {
    height: 14px;
    line-height: 14px;
    margin: 5px;
  }

  /* modal-overlay component */
  .modal-overlay {
    background-color: #00000056;
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 5;
    display: flex;
    justify-content: center;
    align-content: flex-start;
  }

  /* help/conf */
  #conf {
    padding: 8px;
    border-radius: 3px;
    margin-top: 50px;
    background-color: #d8d8d8;
    overflow-y: auto;
    height: 85%;
    width: 90vw;
    line-height: 1.3;
    color: #000000db;
  }

  #conf .settings {
    border-bottom: 1px solid #00000042;
    padding-bottom: 7px;
    margin-bottom: 7px;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  #conf .settings > label {
    vertical-align: middle;
    line-height: 23px;
    cursor: pointer;
  }

  #conf .settings > label:hover {
    background-color: #00000008;
  }

  /* control-tabs */
  #control-tabs {
    z-index: 3;
    position: fixed;
    bottom: 10px;
    left: 0;
    width: 100%;
    height: 300px;
  }

  #control-tabs > .inner {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    width: 95%;
    height: 100%;
    margin: auto;
  }

  #control-tabs > .inner > .buttons {
    flex: 1 0 content;
    display: flex;
    justify-content: stretch;
  }

  #control-tabs > .inner > .buttons button {
    flex: 1 0 auto;
    padding: 4px 10px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border: 1px solid #ccc;
    cursor: pointer;
    color: #0000007d;
    background: #d8d8d8;
    margin-bottom: -1px;
    margin-right: -1px;
  }

  #control-tabs > .inner > .buttons button:last-of-type {
    margin-right: 0px;
  }

  #control-tabs > .inner > .buttons button:hover {
    background: #e0e0e0;
  }

  #control-tabs > .inner > .buttons button[disabled] {
    background: #f0f0f0;
    color: black;
  }

  #control-tabs > .inner > .buttons button[disabled]:hover {
    cursor: default;
  }

  #control-tabs > .inner > .window {
    background-color: white;
    border: 1px solid #ccc;
    flex: 1 1 0%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    overflow: hidden;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }

  #control-tabs > .inner > .window > div {
    position: relative;
    flex: 0 0 content;
    overflow-y: auto;
    overflow-x: hidden;
    color: #212121;
    padding: 5px;
    background-color: #f7f7f7;
  }

  /* control-tab: data single */
  #control-tabs .data.single > div {
    padding: 3px 0;
  }

  #control-tabs .data.single .attr {
    color: #062d06d1;
    font-weight: bold;
    border-radius: 3px;
    display: inline-block;
    background-color: #00800026;
    padding: 2px 5px;
    margin-right: 5px;
    font-size: 104%;
  }

  /* control-tab: data many */
  #control-tabs .data.many {
    padding: 0 !important;
  }

  #control-tabs .data.many .buttons {
    padding: 5px;
    display: flex;
    justify-content: stretch;
    flex-wrap: wrap;
  }

  #control-tabs .data.many button {
    flex: 1 1 auto;
    color: #062d06d1;
    font-weight: bold;
    white-space: nowrap;
    border: none;
    border-radius: 3px;
    display: inline-block;
    background-color: #00800026;
    padding: 2px 5px;
    margin-right: 4px;
    margin-bottom: 4px;
    font-size: 104%;
    cursor: pointer;
  }

  #control-tabs .data.many button:hover {
    background-color: #00800045;
  }

  #control-tabs .data.many button[disabled] {
    background-color: #00800045;
    box-shadow: 0 0 0 1px #00800082 inset;
  }

  #control-tabs .data.many button[disabled]:hover {
    background-color: #00800045;
    cursor: default;
  }

  #control-tabs .data.many .value {
    padding: 5px 5px;
    border-bottom: 1px dashed #0000005e;
  }

  #control-tabs .data.many .value:nth-of-type(odd) {
    background-color: #ababab42;
  }

</style>