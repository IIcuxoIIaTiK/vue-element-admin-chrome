<template>
  <div>     
    <Header/>   
    <Container/>
    <Footer/>
  </div>
</template>

<script>
import Header from '@/options/components/header.vue'
import Container from '@/options/components/container.vue'
import Footer from '@/options/components/footer.vue'

export default {
  components:{
    Header,Container,Footer
  }  
}
</script>
