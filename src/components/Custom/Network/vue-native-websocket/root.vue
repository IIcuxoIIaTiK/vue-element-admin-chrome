<template>
  <div class="app-container">
    <h3>vue-native-websocket</h3>

  </div>
</template>

<script>
import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'
import store from '@/components/admin-lite/store'

// --> https://github.com/nathantsoi/vue-native-websocket#usage
Vue.use(VueNativeSock, 'ws://localhost:3000/ws', {
  connectManually: false,
  store: store,
  passToStoreHandler: function (eventName, event) {
    if (!eventName.startsWith('SOCKET_')) { return }
    let method = 'commit'
    let target = eventName.toUpperCase()
    let msg = event
    if (this.format === 'json' && event.data) {
      msg = JSON.parse(event.data)
      if (msg.mutation) {
        target = [msg.namespace || '', msg.mutation].filter((e) => !!e).join('/')
      } else if (msg.action) {
        method = 'dispatch'
        target = [msg.namespace || '', msg.action].filter((e) => !!e).join('/')
      }
    }
    this.store[method](target, msg)
  },
  // opts: null,
  // format: 'json',
  // protocol: 'my-protocol',
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000 // (Number) how long to initially wait before attempting a new (1000)
})

/*
Vue.use(VueNativeSock, 'ws://localhost:3000', {
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000)
})

Vue.use(VueNativeSock, 'ws://localhost:9090', { protocol: 'my-protocol' })
Vue.use(VueNativeSock, 'ws://localhost:9090', { format: 'json' })
*/
export default {
  // name: 'snk-native-ws',
  data () {
    return {
      connected: false,
      message: null
    }
  },
  /*
  components: {
    VueNativeSock
  },
  */
  mounted () {
    console.log('vue-native-websocket mounted/connected=', this.connected)
  },
  created () {
    console.log('vue-native-websocket mounted/created=', this.connected)
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
      // $socket is [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) instance
      this.$socket.send('some data')
      // or with {format: 'json'} enabled
      this.$socket.sendObj({awesome: 'data'})
    }
  }
}
</script>