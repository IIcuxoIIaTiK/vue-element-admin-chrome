<template>

    <div id="preview">
        <div>
            <div>Global: {{global.content}}</div>
            <textarea v-model="global.content"></textarea>
        </div>

        <div>
            <div>Local: {{local.content}}</div>
            <textarea v-model="local.content"></textarea>
        </div>
    </div>

</template>

<script>
// import Vue from 'vue'
export default {
  data () {
    return this.$root.$data
  }
}
</script>

<style scoped>
#preview {
	left: 0px;
	top: 0px;
	border: 0px;
	position: absolute;
}
</style>
