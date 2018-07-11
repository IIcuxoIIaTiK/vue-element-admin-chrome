<template>
  <div>
    <button @click="doSomethingCool"></button>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        isDoingSomethingCool: false
      }
    },

    methods: {
      doSomethingCool () {
        this.isDoingSomethingCool = true;
      }
    }
  }
</script>
