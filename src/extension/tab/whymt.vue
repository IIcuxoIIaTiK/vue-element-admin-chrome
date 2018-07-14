<template>
  <div id="container">
    <motivator/>
    <siteTiles/>
    <configButton/>
    <template v-if="$store.state.config">
      <config/>
    </template>
  </div>
</template>

<script>
  import Motivator from '@/extension/tab/whymt/components/motivator.vue'
  import SiteTiles from '@/extension/tab/whymt/components/siteTiles.vue'
  import Config from '@/extension/tab/whymt/components/config.vue'
  import ConfigButton from '@/extension/tab/whymt/components/configButton.vue'

  export default {
    name: 'snk-extension-tab-whymt',
    components: {
      'motivator': Motivator,
      'siteTiles': SiteTiles,
      'configButton': ConfigButton,
      'config': Config
    }
  }
</script>

<style>
  html, body {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    height: 100%;
    margin: 0px;
  }

  #container {
    animation: fade-in 600ms ease-out;
    justify-content: center;
    align-items: center;
    display: flex;
    height: 100%;
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
</style>
