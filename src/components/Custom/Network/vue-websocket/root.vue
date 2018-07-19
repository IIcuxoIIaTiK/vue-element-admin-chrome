<template>
  <div class="app-container">
    <h3>vue-websocket</h3>
  </div>
</template>

<script>
import Vue from 'vue'
import VueWebsocket from 'vue-websocket'
Vue.use(VueWebsocket, 'ws://localhost:3000/ws')
// Vue.use(VueWebsocket, 'ws://localhost:3000/todos/sync')

export default {
  // name: 'snk-websocket',
  methods: {
    add () {
      // Emit the server side
      this.$socket.emit('add', { a: 5, b: 3 })
    },
    get () {
      this.$socket.emit('get', { id: 12 }, (response) => {
        console.log('response', response)
      })
    }
  },
  socket: {
    // Prefix for event names
    // prefix: "/counter/",
    // If you set `namespace`, it will create a new socket connection to the namespace instead of `/`
    // namespace: "/counter",
    events: {
      // Similar as this.$socket.on("changed", (msg) => { ... });
      // If you set `prefix` to `/counter/`, the event name will be `/counter/changed`
      //
      changed (msg) {
        console.log('Something changed: ', msg)
      },
      // common socket.io events
      connect () {
        console.log('Websocket connected to ', this.$socket.nsp)
      },
      disconnect () {
        console.log('Websocket disconnected from ', this.$socket.nsp)
      },
      error (err) {
        console.error('Websocket error!', err)
      }
    }
  }
}
</script>