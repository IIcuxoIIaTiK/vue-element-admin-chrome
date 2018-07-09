import Vue from 'vue'
import VueConfig from 'vue-configuration'
import appConfig from './config.js'

// pass config object to the plugin
Vue.use(VueConfig, {
    config: appConfig
})
