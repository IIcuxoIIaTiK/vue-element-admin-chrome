<template>
  <div>
    <Header/>
    <Container/>
    <Footer/>
  </div>
</template>

<script>
import Header from '@/tab/mino/components/header.vue'
import Container from '@/tab/mino/components/container.vue'
import Footer from '@/tab/mino/components/footer.vue'

import '@/tab/mino/styles/style.sass'

export default {
  components: {
    Header,
    Container,
    Footer
  }
}
</script>
