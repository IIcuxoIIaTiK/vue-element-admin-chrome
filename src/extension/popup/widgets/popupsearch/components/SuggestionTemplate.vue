<template>
  <div>
    <b>#{{ item.id }}</b>
    <span>{{ item.name }}</span>
    <abbr>{{ item.description }}</abbr>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      required: true
    },
    searchText: {
      required: true
    }
  },
  created () {
    console.log('popupsearch - suggestion template - created')
  },
  mounted () {
    console.log('popupsearch - suggestion mounted - created')
  }
}
</script>