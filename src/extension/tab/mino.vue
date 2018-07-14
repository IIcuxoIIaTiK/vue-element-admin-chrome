<template>
  <div>
    <Header/>
    <Container/>
    <Footer/>
  </div>
</template>

<script>
import Header from '@/extension/tab/mino/components/header.vue'
import Container from '@/extension/tab/mino/components/container.vue'
import Footer from '@/extension/tab/mino/components/footer.vue'

import '@/extension/tab/mino/styles/style.sass'

export default {
  components: {
    Header,
    Container,
    Footer
  }
}
</script>
