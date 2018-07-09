<template>
  <div id = 'demo'>
    <balloon
      title = 'One Cute Cat'
      position = 'bottom-right'
      @maximize = 'playVideo'
      @minimize = 'pauseVideo'
    >
      <!-- balloon content goes here.. for example a youtube video with the vue-youtube-embed plugin -->
      <youtube video-id = '0Bmhjf0rKe8' ref = 'player'>
      </youtube>
    </balloon>
  </div>
</template>

<script>
  import { Balloon } from 'vue-balloon'

  export default {
    components: { Balloon },

    methods: {
      playVideo () {
        this.$refs.player.player.playVideo()
      },

      pauseVideo () {
        this.$refs.player.player.pauseVideo()
      }
    }
  }
</script>
