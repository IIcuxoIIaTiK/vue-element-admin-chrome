<template>
  <div class="vue-admin-lite">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'vue-admin-lite',
  props: [ ],
  data: () => ({ }),
  computed: { },
  created () {
    console.log('admin-lite created !!!')
  },
  mounted () {
    console.log('admin-lite mounted !!!')
  },
  methods: { }
}
</script>
