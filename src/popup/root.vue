<template lang="pug">
    div
      el-button(type="primary" @click="tab") New tab 
        h1 {{ msg }}
</template>

<script>
  export default {
    data: () => ({
    }),
    computed: { },
    created () {
      console.log('popup/app created !!!')
    },
    mounted () { },
    methods: {
      tab () {
        chrome.tabs.create({ url: 'pages/app.html' })
      }
    }
  }
</script>

<style lang="scss">

html, body {
  width: 600px;
  height: 600px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
