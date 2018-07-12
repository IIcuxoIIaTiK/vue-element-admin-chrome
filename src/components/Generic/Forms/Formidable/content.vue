<template>
    <vue-form :schema="schema" :value="x"></vue-form>
</template>

<script>
  import FormSchemaNative from '@formschema/native'
  import schema from '@/data/json-schema/newsletter-subscription.json'

  export default {
    data: () => ({
      schema: schema,
      model: {}
    }),
    methods: {
      submit (e) {
        // this.model contains the valid data according your JSON Schema.
        // You can submit your model to the server here
      }
    },
    components: { FormSchemaNative }
  }
</script>

<style>
</style>
