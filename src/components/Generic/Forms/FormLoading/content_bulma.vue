<template>
  <form v-loading="{class:'is-loading'}" action="..."  method="...">
    <input type="text" name="" value="">
    <input type="submit" value="Send">
    <button type="submit" class="button is-primary is-fullwidth">Send</button>
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
