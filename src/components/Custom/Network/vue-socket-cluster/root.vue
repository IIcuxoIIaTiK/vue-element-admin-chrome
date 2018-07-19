<template>
  <div class="app-container">
    <h3>vue-socket-cluster</h3>
    <div id="snk_wamp"></div>
    <!-- bind documented events using :on['Event_name'] first letter being a capital letter -->
    <echo-client event="echo" :onConnect="connected" :onMessage="anyMessageData"></echo-client>

    <!-- set the channel attribute to the channel name
    <echo-client channel="channelName" :onData="channelData"></echo-client>
    -->

    <!-- set the event attribute to the event name
    <echo-client event="eventName" :onData="eventData"></echo-client>
    -->

    <!-- send data by changing the data property
    <echo-client :onConnect="connected" :data="message"></echo-client>
    <input :value="message" :disabled="!connected">
    -->

    <!-- bind documented events using :on['Event_name'] first letter being a capital letter
    <echo-client event="echo" :onConnect="connected" :onMessage="anyMessageData"></echo-client>
    -->
  </div>
</template>

<script>
import Vue from 'vue'
import VueSocketCluster from 'vue-socket-cluster'

Vue.use(VueSocketCluster, {
  connections: [{
    name: 'ws', // Each connection object must have a name and the name must be unique in the array
    hostname: 'localhost',
    secure: false,
    port: 3000,
    rejectUnauthorized: false
    // Other socket cluster options
  }]
})

export default {
  // name: 'snk-cluster-ws',
  data () {
    return {
      connected: false,
      message: null
    }
  },
  echoEvents: {
    connect: function () {
      console.log('socket connected')
      this.connected = true
    },
    echo: function (data) {
      console.log(data)
    },
    // Other default events such as ['error','connect','disconnect','connectAbort','connecting', ...]
    // as written on the documentation
    error () {
      console.log('An error occurred on the connection name echo')
    },
    connecting () {
      console.log('socket connecting')
    },
    // ...
    // for hyphen separated events such as 'custom-error' use ...
    customError () {
      console.log('socket custom-error')
    }
  },
  methods: {
    // triggerInstance object = ```connection_name+Client```
    triggerEvent (name, data) {
      this.$echoClient.emit('name', data)
    },
    status () {
      console.log('connected to echo socket server')
    },
    anyMessageData (data) {
      console.log('anyMessageData: ', data)
    },
    receiveData (data) {
      console.log('receiveData: ', data)
    },
    eventData (data) {
      console.log('eventData: ', data)
    },
    channelData (data) {
      console.log('channelData: ', data)
    }
  }
}
</script>
