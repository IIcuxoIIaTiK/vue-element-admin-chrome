<template>
  <form v-loading="'loading...'" action="..."  method="post">
    <input type="text" name="" value="">
    <input type="submit" value="Send">
  </form>
</template>

<script>
  export default {
    data: () => ({ }),
    methods: {
      submit (e) {
        // this.model contains the valid data according your JSON Schema.
        // You can submit your model to the server here
      }
    },
    components: { }
  }
</script>

<style>
</style>
