<template>
  <div class="app-container">
    <h3>vue-websocket</h3>
  </div>
</template>

<script>
import Vue from 'vue'
import VueSocketio from 'vue-socket.io'
import store from '@/components/admin-lite/store'

Vue.use(VueSocketio, 'ws://localhost:3000/ws', store)
// Vue.use(VueSocketio, socketio('http://socketserver.com:1923'), store)
// Vue.use(VueSocketio, 'ws://localhost:3000/todos/sync')

export default {
  // name: 'snk-socketio',
  data () {
    return {
      connected: false,
      message: null
    }
  },
  mounted () {
    console.log('vue-socketio mounted/connected=', this.connected)
  },
  created () {
    console.log('vue-socketio mounted/created=', this.connected)
  },
  sockets: {
    customEmit: function (val) {
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
    },
    changed (msg) {
      console.log('Something changed: ', msg)
      this.message = msg
    },
    // common socket.io events
    connect () {
      console.log('Websocket connected to ', this.$socket.nsp)
      this.connected = true
    },
    disconnect () {
      console.log('Websocket disconnected from ', this.$socket.nsp)
      this.connected = false
    },
    error (err) {
      console.error('Websocket error!', err)
      this.connected = false
    }
  },
  methods: {
    add () {
      // Emit the server side
      this.$socket.emit('add', { a: 5, b: 3 })
    },
    get () {
      this.$socket.emit('get', { id: 12 }, (response) => {
        console.log('response', response)
      })
    },
    clickButton: function (val) {
      // $socket is socket.io-client instance
      this.$socket.emit('emit_method', val)
    }
  }
}
</script>