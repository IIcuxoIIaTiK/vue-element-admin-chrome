<template>
  <div id="app">

      <div  :class="['st-container', menuEffect != '' ? menuEffect : 'st-effect', menuState ? 'st-menu-open' : '']"  
          v-click-outside="onClickOutside">

    <button :class="['snk-button', menuState ? 'snk-button-hidden' : '']" 
            @click="openMenu">SNK</button>

        <nav :class="['st-menu', menuEffect != '' ? menuEffect : 'st-effect']">
        
        </nav>

        <div class="st-pusher" @click="closeMenu">
          <div class="st-content">
            <div id="body-wrapper" class="st-content-inner"></div>
          <div class="vue-admin-lite">
            <div id="admin">
              <vue-admin-lite></vue-admin-lite>
            </div>
          </div>
          </div>
        </div>

      </div>
  </div>
</template>

<script>

import VueAdminLite from '@/content/components/admin-lite/index'

export default {
  name: 'App',
  components: {
    VueAdminLite
  },
  data: () => ({
    menuState: false,
    menuEffect: 'st-effect-13',
    bodyHost: document.querySelectorAll('body > *')
  }),
  computed: { },
  mounted () {
    console.log('[chrome-ext] - content mounted !!!')
    // console.log('[chrome-ext] - this: ', $getFromRegistry('bodyOriginal'))
    // console.log('[chrome-ext] - bodyHost: ', this.bodyHost)
    // console.log('[chrome-ext] - bodyHost: ', this.bodyHost)
    // document.body.appendChild(sidePanel)
    /*
    var i
    for (i = 0; i < this.bodyHost.length; i++) {
      document.getElementById('body-wrapper').appendChild(this.bodyHost[i])
    }
    */
  },
  created () {
    console.log('[chrome-ext] - content created !!!')
  },
  methods: {
    onClickOutside (e, el) {
      console.log('onClickOutside')
      if (this.menuState) {
        this.menuState = false
      }
    },
    setEffect (e) {
      var element = e.currentTarget
      var effect = element.getAttribute('data-effect')
      if (!this.menuState !== '') {
        this.menuEffect = effect
      }
    },
    openMenu () {
      if (!this.menuState) {
        this.menuState = true
      }
    },
    closeMenu () {
      if (this.menuState) {
        this.menuState = false
      }
    }
  }
}
</script>

<style>

  #app {
    position: absolute;
    left: 0px;
    top: 0px;
    height: 100%;
    width: 100%;
  }

  /*
  #sidepanel li a {
    color: #000;
  }
  */

  .user-avatar {
    visibility: hidden;
  }

  .snk-button {
    width: 150px;
    height: 50px;
    position: absolute;
    left: 0;
    top: 0px;
    z-index: 16777272;
    border: none;
    padding: 0.6em 1.2em;
    background: rgba(0,0,0,0.9);
    /* background: #333; */
    color: #fff;
    font-family: 'Lato', Calibri, Arial, sans-serif;
    font-size: 1em;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    display: inline-block;
    margin: 3px 2px;
    border-radius: 2px;
  }
  
  .snk-button-hidden {
    visibility: hidden;
  }

  .snk-button:hover {
    background: #2c774b;
  }

*,
*:after,
*::before {
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.st-container,
.st-pusher,
.st-content {
  width: 100%;
  height: 100%;
  margin: 0px;
  z-index: 0;
  /* background: #444; */
}

.st-content {
  overflow-y: scroll;
  /* background: #f3efe0; */
}

.st-content,
.st-content-inner {
  position: relative;
}

.st-container {
  position: relative;
  overflow: hidden;
}

.st-pusher {
  position: relative;
  left: 0;
  z-index: 99;
  height: 100%;
  perspective: 1000px;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
}

.st-pusher::after {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  background: rgba(0,0,0,0.2);
  content: '';
  opacity: 0;
  -webkit-transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
  transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
}

.st-menu-open .st-pusher::after {
  width: 100%;
  height: 100%;
  opacity: 1;
  -webkit-transition: opacity 0.5s;
  transition: opacity 0.5s;
}

.st-menu {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  visibility: hidden;
  width: 550px;
  height: 100%;
  /* background: rgba(0,0,0,0.8); */
  background: #eee;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}

.st-menu::after {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.2);
  content: '';
  opacity: 1;
  -webkit-transition: opacity 0.5s;
  transition: opacity 0.5s;
}

.st-menu-open .st-menu::after {
  width: 0;
  height: 0;
  opacity: 0;
  -webkit-transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
  transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
}

/* content style */

.st-menu ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.st-menu h2 {
  margin: 0;
  padding: 1em;
  color: rgba(0,0,0,0.4);
  text-shadow: 0 0 1px rgba(0,0,0,0.1);
  font-weight: 300;
  font-size: 2em;
}

.st-menu ul li a {
  display: block;
  padding: 1em 1em 1em 1.2em;
  outline: none;
  box-shadow: inset 0 -1px rgba(0,0,0,0.2);
  color: #f3efe0;
  /*
  text-transform: uppercase;
  text-shadow: 0 0 1px rgba(255,255,255,0.1);
  letter-spacing: 1px;
  font-weight: 400;
  */
  -webkit-transition: background 0.3s, box-shadow 0.3s;
  transition: background 0.3s, box-shadow 0.3s;
}

.st-menu ul li:first-child a {
  box-shadow: inset 0 -1px rgba(0,0,0,0.2), inset 0 1px rgba(0,0,0,0.2);
}

.st-menu ul li a:hover {
  background: rgba(0,0,0,0.2);
  box-shadow: inset 0 -1px rgba(0,0,0,0);
  color: #fff;
}

/* Effect 9: Scale down pusher */

.st-effect.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect.st-menu-open .st-pusher {
  -webkit-transform: translate3d(0, 0, -550px);
  transform: translate3d(0, 0, -550px);
}

.st-effect.st-menu {
  opacity: 1;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect.st-menu-open .st-effect.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect.st-menu::after {
  display: none;
}

/* Individual effects */

/* Effect 1: Slide in on top */
.st-effect-1.st-menu {
  visibility: visible;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-1.st-menu-open .st-effect-1.st-menu {
  visibility: visible;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-1.st-menu::after {
  display: none;
}

/* Effect 2: Reveal */
.st-effect-2.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-2.st-menu {
  z-index: 1;
}

.st-effect-2.st-menu-open .st-effect-2.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
}

.st-effect-2.st-menu::after {
  display: none;
}

/* Effect 3: Push*/
.st-effect-3.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-3.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-3.st-menu-open .st-effect-3.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
}

.st-effect-3.st-menu::after {
  display: none;
}

/* Effect 4: Slide along */
.st-effect-4.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-4.st-menu {
  z-index: 1;
  -webkit-transform: translate3d(-50%, 0, 0);
  transform: translate3d(-50%, 0, 0);
}

.st-effect-4.st-menu-open .st-effect-4.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-4.st-menu::after {
  display: none;
}

/* Effect 5: Reverse slide out */
.st-effect-5.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-5.st-menu {
  z-index: 1;
  -webkit-transform: translate3d(50%, 0, 0);
  transform: translate3d(50%, 0, 0);
}

.st-effect-5.st-menu-open .st-effect-5.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

/* Effect 6: Rotate pusher */

.st-effect-6.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-6 .st-pusher {
  -webkit-transform-origin: 0% 50%;
  transform-origin: 0% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-6.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0) rotateY(-15deg);
  transform: translate3d(550px, 0, 0) rotateY(-15deg);
}

.st-effect-6.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-6.st-menu-open .st-effect-6.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(15deg);
  transform: translate3d(-100%, 0, 0) rotateY(15deg);
}

.st-effect-6.st-menu::after {
  display: none;
}

/* Effect 7: 3D rotate in */

.st-effect-7.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-7 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-7.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-7.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(-90deg);
  transform: translate3d(-100%, 0, 0) rotateY(-90deg);
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-7.st-menu-open .st-effect-7.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(0deg);
  transform: translate3d(-100%, 0, 0) rotateY(0deg);
}

/* Effect 8: 3D rotate out */

.st-effect-8.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-8 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-8.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-8.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(90deg);
  transform: translate3d(-100%, 0, 0) rotateY(90deg);
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-8.st-menu-open .st-effect-8.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(0deg);
  transform: translate3d(-100%, 0, 0) rotateY(0deg);
}

.st-effect-8.st-menu::after {
  display: none;
}

/* Effect 9: Scale down pusher */

.st-effect-9.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-9 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-9.st-menu-open .st-pusher {
  -webkit-transform: translate3d(0, 0, -550px);
  transform: translate3d(0, 0, -550px);
}

.st-effect-9.st-menu {
  opacity: 1;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-9.st-menu-open .st-effect-9.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-9.st-menu::after {
  display: none;
}

/* Effect 10: Scale up */

.st-effect-10.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-10.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-10.st-menu {
  z-index: 1;
  opacity: 1;
  -webkit-transform: translate3d(0, 0, -550px);
  transform: translate3d(0, 0, -550px);
}

.st-effect-10.st-menu-open .st-effect-10.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

/* Effect 11: Scale and rotate pusher */

.st-effect-11.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-11 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-11.st-menu-open .st-pusher {
  -webkit-transform: translate3d(200px, 0, -550px) rotateY(-20deg);
  transform: translate3d(200px, 0, -550px) rotateY(-20deg);
}

.st-effect-11.st-menu {
  opacity: 1;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-11.st-menu-open .st-effect-11.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-11.st-menu::after {
  display: none;
}

/* Effect 12: Open door */

.st-effect-12.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-12 .st-pusher {
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-12.st-menu-open .st-pusher {
  -webkit-transform: rotateY(-10deg);
  transform: rotateY(-10deg);
}

.st-effect-12.st-menu {
  opacity: 1;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-12.st-menu-open .st-effect-12.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-12.st-menu::after {
  display: none;
}

/* Effect 13: Fall down */

.st-effect-13.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-13.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-13.st-menu {
  z-index: 1;
  opacity: 1;
  -webkit-transform: translate3d(0, -100%, 0);
  transform: translate3d(0, -100%, 0);
}

.st-effect-13.st-menu-open .st-effect-13.st-menu {
  visibility: visible;
  -webkit-transition-timing-function: ease-in-out;
  transition-timing-function: ease-in-out;
  -webkit-transition-property: -webkit-transform;
  transition-property: transform;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-transition-speed: 0.2s;
  transition-speed: 0.2s;
}

/* Effect 14: Delayed 3D rotate */

.st-effect-14.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-14 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-14.st-menu-open .st-pusher {
  -webkit-transform: translate3d(550px, 0, 0);
  transform: translate3d(550px, 0, 0);
}

.st-effect-14.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(90deg);
  transform: translate3d(-100%, 0, 0) rotateY(90deg);
  -webkit-transform-origin: 0% 50%;
  transform-origin: 0% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-14.st-menu-open .st-effect-14.st-menu {
  visibility: visible;
  -webkit-transition-delay: 0.1s;
  transition-delay: 0.1s;
  -webkit-transition-timing-function: ease-in-out;
  transition-timing-function: ease-in-out;
  -webkit-transition-property: -webkit-transform;
  transition-property: transform;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(0deg);
  transform: translate3d(-100%, 0, 0) rotateY(0deg);
}


/* Fallback example for browsers that don't support 3D transforms (and no JS fallback) */
.no-csstransforms3d .st-pusher,
.no-js .st-pusher {
  padding-left: 550px;
}

</style>