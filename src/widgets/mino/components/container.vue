<template>
  <div class="container">    
        <Search />
        <Sites />    
  </div>
</template>

<script>

import Search from '@/widgets/mino/container/search.vue'
import Sites from '@/widgets/mino/container/commonsite.vue'

export default {  
  components: {
    Search,Sites
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: calc(100vh - 120px);
  min-height: 50vh;
  position: relative;
  z-index: 1;
}
</style>
