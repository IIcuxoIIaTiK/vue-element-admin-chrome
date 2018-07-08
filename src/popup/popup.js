import Vue from 'vue'
import App from './view/app.vue'

const root = document.createElement('div')
document.getElementsByTagName('body')[0].appendChild(root)

new Vue({
    render: (h) => h(App)
}).$mount(root)