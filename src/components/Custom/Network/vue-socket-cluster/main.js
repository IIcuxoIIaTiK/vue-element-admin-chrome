import Vue from 'vue'
import VueSocketCluster from 'vue-socket-cluster'

import Content from "./root.vue"

Vue.use(VueSocketCluster, {
  connections: [{
    name: 'echo', // Each connection object must have a name and the name must be unique in the array
    hostname: 'localhost',
    secure: false,
    port: 3000,
    rejectUnauthorized: false
    // Other socket cluster options
  }]
})

export default function install (Vue) {
  Vue.component('SnkWsCluster', Content)
}

// auto install
if (typeof window !== 'undefined' && typeof window.Vue !== 'undefined') {
  window.Vue.use(install)
}
