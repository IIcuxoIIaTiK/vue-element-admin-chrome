<template>
  <v-autocomplete :items="items" v-model="item" :get-label="getLabel" :component-item='template' @update-items="updateItems">
</v-autocomplete>
</template>

<script>
import ItemTemplate from './ItemTemplate.vue'
export default {
  data () {
    return {
      item: {id: 9, name: 'Lion', description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'},
      items: [],
      template: ItemTemplate
    }
  },
  methods: {
    getLabel (item) {
      return item.name
    },
    updateItems (text) {
      yourGetItemsMethod(text).then((response) => {
        this.items = response
      })
    }
  }
}
</script>
