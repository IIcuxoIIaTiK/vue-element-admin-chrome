import MultiVue from 'vue-multivue'
import MultiVueComponent from './component.vue'

new MultiVue('.multi-vue', {
    components: {
        MultiVueComponent
    }
})
