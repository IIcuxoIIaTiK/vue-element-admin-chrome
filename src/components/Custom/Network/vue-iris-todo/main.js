import Vue from 'vue'
// import axios from 'axios'
import VueWebsocket from 'vue-websocket'

Vue.use(VueWebsocket, 'ws://localhost:3000/todos/sync')